import {Given, Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {getTestOptions} from '../test-options';
import {TestWorld} from '../support/world';
import {REGULAR_WORK_DAYS_BASIS, WORKER_TYPE_ANSWERS} from '../test_data/CalculatorContract';
import frameworkConfig from '../config/framework.json';

type NavigationTiming = {
  responseEndMs: number;
  domContentLoadedMs: number;
  loadEventEndMs: number;
};

const EXPECTED_CALCULATOR_JOURNEY_PAGES = [
  'Calculator landing page',
  'Worker type question',
  'Calculation basis question',
  'Leave year period question',
  'Employment start date question',
  'Employment end date question',
  'Working days question',
  'Entitlement result',
] as const;

const navigationTimeout = getTestOptions().navigationTimeout;

async function readNavigationTiming(world: TestWorld): Promise<NavigationTiming> {
  return world.pages.numericQuestion.navigationTiming();
}

async function recordNavigation(
  world: TestWorld,
  pageName: string,
  action: () => Promise<void>,
): Promise<void> {
  await world.pages.numericQuestion.captureLoadDuring(action, navigationTimeout);
  const timing = await readNavigationTiming(world);
  world.pageLoadMeasurements.push({
    page: pageName,
    url: world.pages.numericQuestion.currentUrl,
    ...timing,
  });
}

Given('I open the calculator to measure page load performance', async function (this: TestWorld) {
  this.pageLoadMeasurements.length = 0;
  const url = getTestOptions().baseURL;
  await this.pages.landing.open(url, 'load', navigationTimeout);
  this.pageLoadMeasurements.push({
    page: 'Calculator landing page',
    url: this.pages.landing.currentUrl,
    ...(await readNavigationTiming(this)),
  });
  if (await this.pages.cookies.rejectButton.isVisible().catch(() => false)) {
    await this.pages.cookies.rejectAdditionalCookies();
  }
});

When(
  'I complete a long regular-hours employment-period calculation while measuring page loads',
  async function (this: TestWorld) {
    await recordNavigation(this, 'Worker type question', () => this.pages.landing.start());
    await this.pages.workerType.choose(WORKER_TYPE_ANSWERS.regular.label);
    await recordNavigation(this, 'Calculation basis question', () =>
      this.pages.workerType.continue(),
    );
    await this.pages.regularHours.chooseBasis(REGULAR_WORK_DAYS_BASIS);
    await recordNavigation(this, 'Leave year period question', () =>
      this.pages.regularHours.continue(),
    );
    await this.pages.leaveYearPeriod.choosePeriod('starting and leaving');
    await recordNavigation(this, 'Employment start date question', () =>
      this.pages.leaveYearPeriod.continue(),
    );
    await this.pages.employmentStartDate.fillDate('1', '4', '2026');
    await recordNavigation(this, 'Employment end date question', () =>
      this.pages.employmentStartDate.continue(),
    );
    await this.pages.employmentEndDate.fillDate('30', '9', '2026');
    await recordNavigation(this, 'Working days question', () =>
      this.pages.employmentEndDate.continue(),
    );
    await this.pages.numericQuestion.fill('5');
    await recordNavigation(this, 'Entitlement result', () => this.pages.numericQuestion.continue());
    await expect(this.pages.main).toContainText(/statutory entitlement/i);
  },
);

Then(
  'each page should load within the configured budget and its timing should be attached to the report',
  function (this: TestWorld) {
    const budgetMs = Number(
      process.env.PAGE_LOAD_BUDGET_MS ?? frameworkConfig.performance.pageLoadBudgetMs,
    );
    const measurements = this.pageLoadMeasurements;
    this.attach(JSON.stringify({ budgetMs, measurements }, null, 2), {
      mediaType: 'application/json',
      fileName: 'page-load-performance.json',
    });

    expect(
      measurements.map(({ page }) => page),
      'Expected each page in the measured calculator journey to be recorded in order',
    ).toEqual(EXPECTED_CALCULATOR_JOURNEY_PAGES);
    for (const measurement of measurements) {
      expect(
        measurement.loadEventEndMs,
        `${measurement.page} took ${measurement.loadEventEndMs.toFixed(1)} ms to load`,
      ).toBeLessThanOrEqual(budgetMs);
    }
  },
);
