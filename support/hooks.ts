import {
    After,
    AfterAll,
    AfterStep,
    Before,
    BeforeAll,
    BeforeStep,
    setDefaultTimeout,
    Status,
} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {logger} from './logger';
import {BrowserManager} from './browser-manager';
import {TestWorld} from './world';
import {mkdir, writeFile} from 'node:fs/promises';
import {getTestOptions} from '../test-options';
import {assessScenarioDiagnostics, throwForUnexpectedDiagnostics} from './scenario-diagnostics';

type GherkinStepNode = { id: string; location: { line: number } };
type GherkinDocumentNode = {
  background?: { steps?: readonly GherkinStepNode[] };
  scenario?: { steps?: readonly GherkinStepNode[] };
  rule?: { children?: readonly GherkinDocumentNode[] };
};
type GherkinDocumentInfo = {
  uri?: string;
  feature?: { children?: readonly GherkinDocumentNode[] };
};

function sourceLocation(uri: string | undefined, line: number | undefined): string {
  const source = uri?.replaceAll('\\', '/') ?? 'unknown feature';
  return `${source}:line ${line ?? 'unknown'}`;
}

function pageStepLocation(document: GherkinDocumentInfo, astNodeIds: readonly string[]): string {
  const ids = new Set(astNodeIds);
  const findStep = (nodes: readonly GherkinDocumentNode[] = []): GherkinStepNode | undefined => {
    for (const node of nodes) {
      const steps = [...(node.background?.steps ?? []), ...(node.scenario?.steps ?? [])];
      const match = steps.find((step) => ids.has(step.id));
      if (match) return match;
      const nested = findStep(node.rule?.children);
      if (nested) return nested;
    }
    return undefined;
  };

  const step = findStep(document.feature?.children);
  return sourceLocation(document.uri, step?.location.line);
}

// A real browser launch and the live GOV.UK service can take longer than
// Cucumber's 5-second default, even when the page is behaving correctly.
const testOptions = getTestOptions();
const scenarioAttempts = new Map<string, number>();
type ScenarioMetric = {
  id: string;
  name: string;
  status: string;
  tags: string[];
  attempt: number;
  durationMs: number;
  failureCategory: string | null;
};
const scenarioMetrics: ScenarioMetric[] = [];
const scenarioStartedAt = new Map<string, number>();

setDefaultTimeout(testOptions.stepTimeout);
expect.configure({ timeout: testOptions.expectTimeout });

BeforeAll(async function () {
  await mkdir(testOptions.reportDir, { recursive: true });
  await BrowserManager.launch();
});

Before(async function (this: TestWorld, { gherkinDocument, pickle }) {
  this.attemptNumber = scenarioAttempts.get(pickle.id) ?? 0;
  scenarioAttempts.set(pickle.id, this.attemptNumber + 1);
  scenarioStartedAt.set(pickle.id, Date.now());
  logger.info({
    message: `Scenario started: ${pickle.name}`,
    page: sourceLocation(gherkinDocument.uri, pickle.location?.line),
  });
  await this.startBrowser();
});

BeforeStep(function ({ gherkinDocument, pickleStep }) {
  logger.info({
    message: `Step started: ${pickleStep.text}`,
    page: pageStepLocation(gherkinDocument, pickleStep.astNodeIds),
  });
});

AfterStep(function ({ gherkinDocument, pickleStep, result }) {
  const log = result.status === Status.FAILED ? 'error' : 'info';
  logger.log({
    level: log,
    message: `Step ${result.status.toLowerCase()}: ${pickleStep.text}`,
    page: pageStepLocation(gherkinDocument, pickleStep.astNodeIds),
  });
});

async function attachFailureArtifacts(world: TestWorld, scenarioName: string): Promise<void> {
  const page = world.page;
  if (!page || page.isClosed()) {
    world.attach('Screenshot unavailable: the scenario page was not open.', 'text/plain');
    return;
  }

  try {
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      timeout: testOptions.screenshotTimeout,
    });
    world.attach(screenshot, {
      mediaType: 'image/png',
      fileName: `${scenarioName.replace(/[^a-z0-9-_]+/gi, '-')}-failure.png`,
    });
    logger.info('Attached failure screenshot for: %s', scenarioName);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Could not capture failure screenshot: %s', message);
    world.attach(`Screenshot capture failed: ${message}`, {
      mediaType: 'text/plain',
      fileName: 'failure-screenshot-error.txt',
    });
  }

  try {
    world.attach(
      JSON.stringify(
        {
          url: page.url(),
          title: await page.title(),
          browserDiagnostics: world.browserDiagnostics,
        },
        null,
        2,
      ),
      { mediaType: 'application/json', fileName: 'failure-diagnostics.json' },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    world.attach(`Diagnostic capture failed: ${message}`, {
      mediaType: 'text/plain',
      fileName: 'failure-diagnostics-error.txt',
    });
  }
}

function actionableBrowserDiagnostics(world: TestWorld): string[] {
  const ignoredFragments = (process.env.BROWSER_DIAGNOSTIC_IGNORE ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  // Uncaught page errors and console errors fail scenarios. Network failures and
  // HTTP responses remain attached evidence because GOV.UK can load optional
  // third-party resources and intentional negative tests may trigger 4xx responses.
  // Firefox reports GOV.UK's GDS Transport font metadata as a console error even
  // though it falls back to a usable font and the calculation remains operable.
  return world.browserDiagnostics.filter((diagnostic) => {
    const isPageError = diagnostic.startsWith('Page error:');
    const isGovUkFontWarning =
      diagnostic.includes('downloadable font:') && diagnostic.includes('GDS Transport');
    const isConsoleError =
      diagnostic.startsWith('Console error:') &&
      !diagnostic.includes('Failed to load resource:') &&
      !isGovUkFontWarning;
    const isActionable = isPageError || isConsoleError;
    return (
      isActionable &&
      !ignoredFragments.some((fragment) => diagnostic.toLowerCase().includes(fragment))
    );
  });
}

function classifyFailure(message: string, diagnostics: readonly string[]): string {
  const text = `${message}\n${diagnostics.join('\n')}`.toLowerCase();
  if (/certificate|tls|ssl|cert_error|err_cert/.test(text)) return 'tls';
  if (/net::|network|dns|connection|navigation.*timeout|request failed/.test(text))
    return 'network';
  if (/http 4\d\d|http 5\d\d|status code 4\d\d|status code 5\d\d/.test(text))
    return 'service-response';
  if (/unexpected browser diagnostics|page error|console error/.test(text))
    return 'browser-diagnostic';
  if (/expect\(|expected|to be visible|to contain|to have|assertion/.test(text)) return 'assertion';
  if (/browser.*launch|target crashed|newpage/.test(text)) return 'browser-startup';
  return 'other';
}

After(async function (this: TestWorld, scenario) {
  const alreadyFailed = scenario.result?.status === Status.FAILED;
  const actionableDiagnostics = [
    ...actionableBrowserDiagnostics(this),
    ...this.requiredResourceDiagnostics,
  ];
  const diagnosticAssessment = assessScenarioDiagnostics(
    this,
    actionableDiagnostics,
    alreadyFailed,
  );
  const effectiveFailure = diagnosticAssessment.failed;
  const errorText = scenario.result?.message ?? actionableDiagnostics.join('\n');
  scenarioMetrics.push({
    id: scenario.pickle.id,
    name: scenario.pickle.name,
    status: effectiveFailure ? Status.FAILED : (scenario.result?.status ?? 'UNKNOWN'),
    tags: scenario.pickle.tags.map((tag) => tag.name),
    attempt: this.attemptNumber,
    durationMs: Date.now() - (scenarioStartedAt.get(scenario.pickle.id) ?? Date.now()),
    failureCategory: effectiveFailure ? classifyFailure(errorText, this.browserDiagnostics) : null,
  });
  logger.info({
    message: `Scenario ${scenario.result?.status?.toLowerCase()}: ${scenario.pickle.name}`,
    page: sourceLocation(scenario.gherkinDocument.uri, scenario.pickle.location?.line),
  });
  try {
    const shouldKeepTrace =
      testOptions.trace === 'on' ||
      (testOptions.trace === 'on-failure' && (alreadyFailed || actionableDiagnostics.length > 0)) ||
      (testOptions.trace === 'on-first-retry' && this.attemptNumber === 1);
    await this.finishTrace(scenario.pickle.name, shouldKeepTrace);
    if (alreadyFailed || actionableDiagnostics.length > 0) {
      await attachFailureArtifacts(this, scenario.pickle.name);
    }
    throwForUnexpectedDiagnostics(diagnosticAssessment);
  } finally {
    await this.stopBrowser();
  }
});

AfterAll(async function () {
  // Keep per-scenario attempt state across retries. Cucumber's
  // `willBeRetried` hook parameter is deprecated, so release the state once
  // the complete suite (including retries) has finished.
  scenarioAttempts.clear();
  scenarioStartedAt.clear();

  const bySuite = new Map<string, Map<string, ScenarioMetric[]>>();
  for (const metric of scenarioMetrics) {
    const suite = metric.tags.includes('@cross_browser')
      ? 'cross-browser'
      : metric.tags.some((tag) => ['@local_app', '@local_calculator', '@local_page'].includes(tag))
        ? 'local'
        : metric.tags.includes('@requires_network')
          ? 'live-service'
          : 'other';
    const suiteScenarios = bySuite.get(suite) ?? new Map<string, ScenarioMetric[]>();
    const attempts = suiteScenarios.get(metric.id) ?? [];
    attempts.push(metric);
    suiteScenarios.set(metric.id, attempts);
    bySuite.set(suite, suiteScenarios);
  }

  const suites = Object.fromEntries(
    [...bySuite].map(([suite, scenarios]) => {
      const finalAttempts = [...scenarios.values()].map(
        (attempts) => attempts.sort((left, right) => left.attempt - right.attempt).at(-1)!,
      );
      const count = finalAttempts.length;
      const passed = finalAttempts.filter((attempt) => attempt.status === Status.PASSED).length;
      const retried = [...scenarios.values()].filter((attempts) => attempts.length > 1).length;
      return [
        suite,
        {
          scenarios: count,
          passed,
          failed: count - passed,
          passRate: count ? Number((passed / count).toFixed(4)) : 0,
          retriedScenarios: retried,
          retryRate: count ? Number((retried / count).toFixed(4)) : 0,
          durationMs: finalAttempts.reduce((total, attempt) => total + attempt.durationMs, 0),
          failureCategories: Object.fromEntries(
            [
              ...new Set(finalAttempts.map((attempt) => attempt.failureCategory).filter(Boolean)),
            ].map((category) => [
              category!,
              finalAttempts.filter((attempt) => attempt.failureCategory === category).length,
            ]),
          ),
        },
      ];
    }),
  );
  const summary = {
    browser: testOptions.browser,
    environment: testOptions.environment,
    target: new URL(testOptions.baseURL).origin,
    suites,
  };
  const summaryPath = `${testOptions.reportDir}/reliability-summary-${process.pid}-${Date.now()}.json`;
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  logger.info('Suite reliability summary: %s', JSON.stringify(summary));
  logger.info('Suite reliability summary written to %s', summaryPath);
  await BrowserManager.close();
});
