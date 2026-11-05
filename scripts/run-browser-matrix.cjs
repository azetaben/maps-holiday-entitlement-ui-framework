const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
require('ts-node/register');
const { getTestOptions, loadTestEnvironment } = require('../test-options');

loadTestEnvironment();

const mode = process.argv[2];
if (!['local', 'live', 'smoke'].includes(mode)) {
  throw new Error('Choose the browser-matrix profile "local", "live", or "smoke".');
}

const browsers = ['chromium', 'firefox', 'webkit'];
const cucumberEntry = path.resolve(__dirname, '../node_modules/@cucumber/cucumber/bin/cucumber.js');
const localRunner = path.resolve(__dirname, 'run-local-suite.cjs');
const profile =
  mode === 'local' ? 'local-calculator' : mode === 'smoke' ? 'live-smoke' : 'live-compatibility';

function failureCategory(output, exitCode) {
  const text = output.toLowerCase();
  if (/certificate|tls|ssl|err_cert/.test(text)) return 'tls';
  if (/net::|network_access_denied|dns|connection refused|request failed/.test(text))
    return 'network';
  if (/http [45]\d\d|status code [45]\d\d/.test(text)) return 'service-response';
  if (/expect\(|expected|to be visible|to contain|to have/.test(text)) return 'assertion';
  if (/unexpected browser diagnostics|console error|page error/.test(text))
    return 'browser-diagnostic';
  if (exitCode !== 0 && /target crashed|browser.*launch|newpage/.test(text))
    return 'browser-startup';
  return exitCode === 0 ? null : 'other';
}

async function runBrowser(browser) {
  const env = {
    ...process.env,
    BROWSER: browser,
    HEADLESS: 'true',
  };
  const childArgs =
    mode === 'local'
      ? [localRunner]
      : [
          cucumberEntry,
          '--tags',
          mode === 'smoke'
            ? '@live_smoke and @requires_network'
            : '@cross_browser and @requires_network',
          '--format',
          `junit:reports/${profile}-${browser}.xml`,
        ];
  env.STABILITY_JUNIT_FILE = `reports/${profile}-${browser}.xml`;
  if (Number(env.RETRY ?? 0) > 0 && mode !== 'local') {
    childArgs.push('--retry', String(env.RETRY));
  }

  if (mode === 'local') {
    env.LOCAL_CALCULATOR = 'true';
    env.LOCAL_TAGS = '@local_calculator';
  }

  const started = Date.now();
  const output = [];
  console.log(`\n=== ${profile}: ${browser} ===`);
  const exitCode = await new Promise((resolve) => {
    const child = spawn(process.execPath, childArgs, { stdio: ['inherit', 'pipe', 'pipe'], env });
    for (const stream of [child.stdout, child.stderr]) {
      stream.setEncoding('utf8');
      stream.on('data', (chunk) => {
        output.push(chunk);
        process.stdout.write(chunk);
      });
    }
    child.once('error', (error) => {
      console.error(`${browser} could not start: ${error.message}`);
      resolve(1);
    });
    child.once('exit', (code, signal) => {
      if (signal) {
        console.error(`${browser} exited after ${signal}.`);
        resolve(1);
      } else {
        resolve(code ?? 1);
      }
    });
  });

  const captured = output.join('');
  const summaryLine = captured.match(/Suite reliability summary: (\{[^\r\n]+\})/);
  let reliability = null;
  if (summaryLine) {
    try {
      reliability = JSON.parse(summaryLine[1]);
    } catch {
      reliability = null;
    }
  }
  return {
    browser,
    passed: exitCode === 0,
    exitCode,
    durationMs: Date.now() - started,
    failureCategory: failureCategory(captured, exitCode),
    reliability,
  };
}

async function main() {
  const startedAt = new Date().toISOString();
  const reportDir = getTestOptions().reportDir;
  await fs.mkdir(reportDir, { recursive: true });
  const results = [];
  const requestedBrowsers = mode === 'smoke' ? ['chromium'] : browsers;
  const excluded = (process.env.LIVE_BROWSER_EXCLUDE ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const exclusionReason = process.env.LIVE_BROWSER_EXCLUDE_REASON?.trim();
  if (mode !== 'local' && excluded.length && !exclusionReason) {
    throw new Error('LIVE_BROWSER_EXCLUDE_REASON is required when excluding live browsers.');
  }
  for (const browser of requestedBrowsers) {
    if (mode !== 'local' && excluded.includes(browser)) {
      results.push({
        browser,
        passed: null,
        excluded: true,
        exclusionReason,
        failureCategory: null,
      });
    } else {
      results.push(await runBrowser(browser));
    }
  }
  const minimumPassRate = Number(
    process.env[
      mode === 'local' ? 'STABILITY_MIN_PASS_RATE_LOCAL' : 'STABILITY_MIN_PASS_RATE_LIVE'
    ] ?? 1,
  );
  const maximumRetryRate = Number(process.env.STABILITY_MAX_RETRY_RATE ?? 0.05);

  const summary = {
    profile,
    startedAt,
    completedAt: new Date().toISOString(),
    browsers: results,
    criteria: { minimumPassRate, maximumRetryRate },
    exclusions: results
      .filter((result) => result.excluded)
      .map(({ browser, exclusionReason: reason }) => ({ browser, reason })),
    passed: results.filter((result) => result.passed === true).length,
    failed: results.filter((result) => result.passed === false).length,
    excluded: results.filter((result) => result.excluded).length,
  };
  for (const result of results) {
    const suites = Object.values(result.reliability?.suites ?? {});
    result.scenarios = suites.reduce((total, suite) => total + suite.scenarios, 0);
    result.passedScenarios = suites.reduce((total, suite) => total + suite.passed, 0);
    result.passRate = result.scenarios
      ? Number((result.passedScenarios / result.scenarios).toFixed(4))
      : 0;
    result.retryRate = result.scenarios
      ? Number(
          (
            suites.reduce((total, suite) => total + suite.retriedScenarios, 0) / result.scenarios
          ).toFixed(4),
        )
      : 0;
    result.durationMs =
      suites.reduce((total, suite) => total + (suite.durationMs ?? 0), 0) || result.durationMs;
    result.failureCategories = Object.assign(
      {},
      ...suites.map((suite) => suite.failureCategories ?? {}),
    );
  }
  const summaryPath = path.join(reportDir, `browser-matrix-${profile}-${process.pid}.json`);
  await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(`\nBrowser matrix summary: ${JSON.stringify(summary)}`);
  console.log(`Browser matrix summary written to ${summaryPath}`);
  const belowThreshold = results.some(
    (result) =>
      !result.excluded &&
      (result.passRate < minimumPassRate || result.retryRate > maximumRetryRate),
  );
  if (summary.failed > 0 || belowThreshold) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exitCode = 1;
});
