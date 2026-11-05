const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');
const path = require('node:path');
const profile = process.env.ENV ?? (process.env.CI ? 'ci' : 'local');
require('dotenv').config({ path: `env/.env.${profile}`, override: false });
const frameworkConfig = require('../config/framework.json');

const configuredUrl = new URL(process.env.LOCAL_APP_URL ?? frameworkConfig.urls.localApp);
if (process.env.LOCAL_APP_PORT) configuredUrl.port = process.env.LOCAL_APP_PORT;
const baseUrl = configuredUrl.toString();
const port = configuredUrl.port || (configuredUrl.protocol === 'https:' ? '443' : '80');
const tags = process.env.LOCAL_TAGS ?? '@local_smoke or (@local_page and @links)';
const serverEntry = require.resolve('http-server/bin/http-server');
const cucumberEntry = path.resolve('node_modules/@cucumber/cucumber/bin/cucumber.js');
const timeouts = frameworkConfig.timeouts;

let server;
let cucumber;
let serverStartError;
let stopping = false;

function stop(child) {
  if (child && !child.killed) child.kill();
}

async function waitForServer() {
  const deadline = Date.now() + timeouts.localServerStartup;
  while (Date.now() < deadline) {
    if (serverStartError) {
      throw new Error(`Could not start local web server: ${serverStartError.message}`);
    }
    if (server.exitCode !== null) {
      throw new Error(`Local web server exited early with code ${server.exitCode}.`);
    }
    try {
      const response = await fetch(baseUrl, {
        signal: AbortSignal.timeout(timeouts.localServerProbe),
      });
      if (response.ok && (await response.text()).includes('contact-page')) return;
    } catch {
      // The server is still starting; retry until the startup deadline.
    }
    await delay(timeouts.localServerPoll);
  }
  throw new Error(
    `Local app did not become available at ${baseUrl} within ${timeouts.localServerStartup} ms.`,
  );
}

async function run() {
  process.env.LOCAL_APP_URL = baseUrl;
  if (process.env.LOCAL_CALCULATOR === 'true') {
    process.env.HOLIDAY_BASE_URL = new URL('calculator/', baseUrl).toString();
  }
  let alreadyRunning = false;
  let existingResponse;
  let existingBody = '';
  try {
    existingResponse = await fetch(baseUrl, {
      signal: AbortSignal.timeout(timeouts.localServerProbe),
    });
    existingBody = await existingResponse.text();
    alreadyRunning = existingResponse.ok && existingBody.includes('contact-page');
  } catch {
    // Start the local server below when no app is responding at the configured URL.
  }
  if (existingResponse?.ok && !alreadyRunning) {
    throw new Error(`Another application is responding at ${baseUrl}; choose another port.`);
  }

  if (!alreadyRunning) {
    server = spawn(
      process.execPath,
      [serverEntry, frameworkConfig.localAppRoot, '-p', port, '-c-1'],
      {
        stdio: 'inherit',
      },
    );
    server.once('error', (error) => {
      serverStartError = error;
    });
    await waitForServer();
  }

  const cucumberArgs = [cucumberEntry, '--tags', tags];
  if (process.env.STABILITY_JUNIT_FILE) {
    cucumberArgs.push('--format', `junit:${process.env.STABILITY_JUNIT_FILE}`);
  }
  if (Number(process.env.RETRY ?? 0) > 0) {
    cucumberArgs.push('--retry', String(process.env.RETRY));
  }
  cucumber = spawn(process.execPath, cucumberArgs, {
    stdio: 'inherit',
    env: process.env,
  });

  const result = await new Promise((resolve, reject) => {
    cucumber.once('error', reject);
    cucumber.once('exit', (code, signal) => {
      if (signal) reject(new Error(`Cucumber exited after signal ${signal}.`));
      else resolve(code ?? 1);
    });
  });
  process.exitCode = result;
}

async function shutdown() {
  if (stopping) return;
  stopping = true;
  stop(cucumber);
  stop(server);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

run()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(shutdown);
