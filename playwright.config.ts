import {defineConfig, devices} from '@playwright/test';
import {getTestOptions, loadTestEnvironment} from './test-options';
import frameworkConfig from './config/framework.json';

loadTestEnvironment();
const options = getTestOptions();
const traceMode = options.trace === 'on-failure' ? 'retain-on-failure' : options.trace;

/** Playwright-native suites share the same browser, target, timeout, and artifact settings as Cucumber. */
export default defineConfig({
  testDir: './tests/unit',
  testMatch: '**/*.spec.ts',
  outputDir: options.artifactsDir,
  timeout: options.stepTimeout,
  expect: {
    timeout: options.expectTimeout,
    toHaveScreenshot: { maxDiffPixels: 50 },
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: options.retry,
  workers: options.parallel || undefined,
  reporter: [
    ['list'],
    ['junit', { outputFile: `${options.reportDir}/playwright-junit.xml` }],
    ['html', { outputFolder: `${options.reportDir}/playwright-html`, open: 'never' }],
  ],
  use: {
    baseURL: options.baseURL,
    browserName: options.browser,
    ...(options.channel ? { channel: options.channel } : {}),
    headless: options.headless,
    viewport: options.viewport,
    actionTimeout: options.actionTimeout,
    navigationTimeout: options.navigationTimeout,
    trace: traceMode,
    screenshot: 'only-on-failure',
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Run your local dev server before starting the tests */
  ...(process.env.PLAYWRIGHT_SKIP_WEBSERVER === 'true'
    ? {}
    : {
        webServer: {
          command: 'npm start',
          url: new URL(frameworkConfig.urls.localApp).origin,
          reuseExistingServer: !process.env.CI,
        },
      }),
});
