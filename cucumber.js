if (process.env.FORCE_COLOR === undefined && process.env.NO_COLOR === undefined) {
  process.env.FORCE_COLOR = '1';
}
require('ts-node/register');
const { getTestOptions, loadTestEnvironment } = require('./test-options');
loadTestEnvironment();
const options = getTestOptions();

const os = require('node:os');
const { Status } = require('allure-js-commons');
const browserName = options.browser;
const browserLabel = browserName[0].toUpperCase() + browserName.slice(1);

function safeBaseUrl(value) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return 'not configured';
  }
}

const links = {};
if (process.env.ALLURE_ISSUE_URL_TEMPLATE) {
  links.issue = {
    pattern: [/@issue:(.*)/],
    urlTemplate: process.env.ALLURE_ISSUE_URL_TEMPLATE,
    nameTemplate: 'Issue %s',
  };
}
if (process.env.ALLURE_TMS_URL_TEMPLATE) {
  links.tms = {
    pattern: [/@tms:(.*)/],
    urlTemplate: process.env.ALLURE_TMS_URL_TEMPLATE,
    nameTemplate: 'Test case %s',
  };
}

module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['support/**/*.ts', 'step-definitions/**/*.ts'],
    format: [
      'progress',
      `html:${options.reportDir}/cucumber-report.html`,
      ...(process.env.CUCUMBER_JUNIT_FILE ? [`junit:${process.env.CUCUMBER_JUNIT_FILE}`] : []),
      'allure-cucumberjs/reporter',
    ],
    formatOptions: {
      resultsDir: process.env.ALLURE_RESULTS_DIR ?? 'allure-results',
      labels: [
        { pattern: [/@epic:(.*)/], name: 'epic' },
        { pattern: [/@feature:(.*)/], name: 'feature' },
        { pattern: [/@story:(.*)/], name: 'story' },
        { pattern: [/@suite:(.*)/], name: 'suite' },
        { pattern: [/@severity:(.*)/], name: 'severity' },
        { pattern: [/@owner:(.*)/], name: 'owner' },
        { pattern: [/@layer:(.*)/], name: 'layer' },
      ],
      links,
      categories: [
        {
          name: 'Browser and network errors',
          description: 'Browser launch, navigation, timeout, or network failure.',
          messageRegex: 'net::ERR_|Timeout|timed out|ECONN|request failed',
          matchedStatuses: [Status.BROKEN],
        },
        {
          name: 'Assertion failures',
          description: 'A page or expected value did not match the test expectation.',
          matchedStatuses: [Status.FAILED],
        },
        {
          name: 'Other test errors',
          matchedStatuses: [Status.BROKEN],
        },
      ],
      environmentInfo: {
        target_url: safeBaseUrl(options.baseURL),
        browser: browserLabel,
        channel: options.channel ?? 'bundled',
        browser_mode: options.headless ? 'headless' : 'headed',
        environment: options.environment,
        node_version: process.version,
        os_platform: os.platform(),
        os_release: os.release(),
        os_arch: os.arch(),
        ci: process.env.CI ? 'true' : 'false',
      },
      globalLabels: [
        { name: 'layer', value: process.env.ALLURE_LAYER ?? 'UI' },
        { name: 'framework', value: 'Cucumber.js + Playwright' },
        { name: 'browser', value: browserLabel },
        ...(process.env.ALLURE_OWNER ? [{ name: 'owner', value: process.env.ALLURE_OWNER }] : []),
      ],
    },
    parallel: options.parallel,
    retry: options.retry,
    publishQuiet: true,
  },
};
