import frameworkConfig from './config/framework.json';
import dotenv from 'dotenv';
import path from 'node:path';

/** The single runtime contract shared by Cucumber, browser lifecycle and Playwright. */
export interface TestOptions {
  // Environment and target
  /** Name of the loaded env/.env.<ENV> profile, recorded with failure evidence. */
  environment: string;
  baseURL: string;
  browser: Browser;
  channel?: Channel;
  headless: boolean;
  // Timeouts and browser viewport
  stepTimeout: number;
  actionTimeout: number;
  navigationTimeout: number;
  expectTimeout: number;
  screenshotTimeout: number;
  viewport: { width: number; height: number };
  // Reports, parallelism and retry behaviour
  artifactsDir: string;
  reportDir: string;
  parallel: number;
  retry: number;
  // Diagnostics and network capture
  trace: TraceMode;
  har: HarMode;
  harDir: string;
}

export const BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
export const CHANNELS = ['chrome', 'msedge'] as const;
/**
 * `on-failure` records every attempt but keeps only failing traces. `on-first-retry` records only
 * the first retry (Playwright's CI default): first attempts run untraced, so it is far cheaper.
 */
export const TRACE_MODES = ['off', 'on-failure', 'on-first-retry', 'on'] as const;
/** `replay` serves @contract scenarios from recorded HAR files; `record` refreshes them. */
export const HAR_MODES = ['off', 'record', 'replay'] as const;

export type Browser = (typeof BROWSERS)[number];
export type Channel = (typeof CHANNELS)[number];
export type TraceMode = (typeof TRACE_MODES)[number];
export type HarMode = (typeof HAR_MODES)[number];

const DEFAULT_REPORT_DIR = 'reports';

/** Load the same named environment profile before either test runner reads its options. */
export function loadTestEnvironment(env: NodeJS.ProcessEnv = process.env): string {
  const profile = env.ENV?.trim() || (env.CI ? 'ci' : 'local');
  dotenv.config({
    path: path.resolve(process.cwd(), 'env', `.env.${profile}`),
    override: false,
  });
  return profile;
}

function integer(env: NodeJS.ProcessEnv, name: string, fallback: number, minimum = 1): number {
  const value = env[name]?.trim() || String(fallback);
  if (!/^\d+$/.test(value) || Number(value) < minimum || !Number.isSafeInteger(Number(value))) {
    throw new Error(`${name} must be an integer greater than or equal to ${minimum}`);
  }
  return Number(value);
}

function oneOf<T extends string>(
  env: NodeJS.ProcessEnv,
  name: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = env[name]?.trim().toLowerCase() || fallback;
  if (!(allowed as readonly string[]).includes(value)) {
    throw new Error(`${name} must be one of: ${allowed.join(', ')}`);
  }
  return value as T;
}

function directory(env: NodeJS.ProcessEnv, name: string, fallback: string): string {
  return env[name]?.trim() || fallback;
}

function baseURL(env: NodeJS.ProcessEnv): string {
  const value = env.HOLIDAY_BASE_URL ?? env.BASE_URL ?? frameworkConfig.urls.holidayCalculator;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('HOLIDAY_BASE_URL (or BASE_URL) must be a valid URL');
  }
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      'The calculator URL must use HTTP(S) without credentials, a query or a fragment',
    );
  }
  return value.replace(/\/$/, '');
}

export function getTestOptions(env: NodeJS.ProcessEnv = process.env): TestOptions {
  const browser = oneOf(env, 'BROWSER', BROWSERS, frameworkConfig.browser.default as Browser);
  const channel = env.CHANNEL?.trim() ? oneOf(env, 'CHANNEL', CHANNELS, 'chrome') : undefined;
  if (channel && browser !== 'chromium') {
    throw new Error('CHANNEL requires BROWSER=chromium');
  }
  const reportDir = directory(env, 'REPORT_DIR', DEFAULT_REPORT_DIR);
  const retry = integer(env, 'RETRY', 0, 0);
  const trace = oneOf(env, 'TRACE', TRACE_MODES, 'on-failure');
  if (trace === 'on-first-retry' && retry === 0) {
    throw new Error('TRACE=on-first-retry records nothing unless RETRY is at least 1');
  }
  return {
    environment: env.ENV?.trim() || (env.CI ? 'ci' : 'local'),
    baseURL: baseURL(env),
    browser,
    channel: channel as Channel | undefined,
    headless:
      oneOf(
        env,
        'HEADLESS',
        ['true', 'false'],
        String(frameworkConfig.browser.headless) as 'true' | 'false',
      ) === 'true',
    stepTimeout: integer(env, 'STEP_TIMEOUT', frameworkConfig.timeouts.step),
    actionTimeout: integer(env, 'ACTION_TIMEOUT', frameworkConfig.timeouts.action),
    navigationTimeout: integer(env, 'NAVIGATION_TIMEOUT', frameworkConfig.timeouts.navigation),
    expectTimeout: integer(env, 'EXPECT_TIMEOUT', frameworkConfig.timeouts.expectation),
    screenshotTimeout: integer(env, 'SCREENSHOT_TIMEOUT', frameworkConfig.timeouts.screenshot),
    viewport: {
      width: integer(env, 'BROWSER_WIDTH', frameworkConfig.browser.viewport.width),
      height: integer(env, 'BROWSER_HEIGHT', frameworkConfig.browser.viewport.height),
    },
    artifactsDir: directory(env, 'ARTIFACTS_DIR', `${reportDir}/artifacts`),
    reportDir,
    parallel: integer(env, 'PARALLEL', 0, 0),
    retry,
    trace,
    har: oneOf(env, 'HAR', HAR_MODES, 'off'),
    harDir: directory(env, 'HAR_DIR', `${reportDir}/artifacts/har`),
  };
}
