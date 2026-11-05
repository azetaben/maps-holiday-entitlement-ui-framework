import {Given, Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {openRegularDaysQuestion, openWorkerQuestion} from '../support/journey-helpers';
import {TestWorld} from '../support/world';
import {
    FULL_LEAVE_YEAR_PERIOD,
    HOURS_WORKED_PER_WEEK_BASIS,
    WORKER_TYPE_ANSWERS,
} from '../test_data/CalculatorContract';

Given(
  "I am calculating a regular worker's entitlement for a full leave year",
  async function (this: TestWorld) {
    await openRegularDaysQuestion(this);
  },
);

When(
  /^I enter (\d+(?:\.\d+)?) working days? per week and complete the calculation$/,
  async function (this: TestWorld, days: string) {
    await openRegularDaysQuestion(this);
    await this.pages.numericQuestion.fill(days);
    await this.pages.numericQuestion.continue();
  },
);

When(
  /^I submit (\d+(?:\.\d+)?) working days per week$/,
  async function (this: TestWorld, days: string) {
    await openRegularDaysQuestion(this);
    await this.pages.numericQuestion.fill(days);
    await this.pages.numericQuestion.continue();
  },
);

Then(
  'the working-days answer {string} should be {word}',
  async function (this: TestWorld, days: string, outcome: string) {
    if (outcome === 'accepted') {
      const errors = this.pages.numericQuestion.errorSummary;
      const errorCount = await errors.count();
      if (errorCount > 0) {
        const message = (await errors.first().innerText()).trim();
        throw new Error(
          `Expected ${days} working days per week to be accepted, but the page reported: ${message}`,
        );
      }
      return;
    }
    if (outcome === 'rejected') {
      await expect(
        this.pages.numericQuestion.errorSummary,
        `Expected ${days} working days per week to be rejected.`,
      ).toBeVisible();
      return;
    }
    throw new Error(`Unsupported working-days outcome "${outcome}". Use accepted or rejected.`);
  },
);

When(
  /^I enter (\d+(?:\.\d+)?) working hours over (\d+(?:\.\d+)?) working days per week$/,
  async function (this: TestWorld, hours: string, days: string) {
    await openWorkerQuestion(this);
    await this.pages.workerType.choose(WORKER_TYPE_ANSWERS.regular.label);
    await this.pages.workerType.continue();
    await this.pages.regularHours.chooseBasis(HOURS_WORKED_PER_WEEK_BASIS);
    await this.pages.regularHours.continue();
    await this.pages.leaveYearPeriod.choosePeriod(FULL_LEAVE_YEAR_PERIOD);
    await this.pages.leaveYearPeriod.continue();
    await this.pages.numericQuestion.fill(hours);
    await this.pages.numericQuestion.continue();
    await this.pages.numericQuestion.fill(days);
  },
);

When('I complete the calculation', async function (this: TestWorld) {
  await this.pages.numericQuestion.continue();
});

Then('the result should clearly identify the unit as hours', async function (this: TestWorld) {
  await expect(this.pages.main).toContainText(/\bhours\b/i);
});

Given(
  'I have a full-year regular-worker result of {int} days for a five-day week',
  async function (this: TestWorld, expectedDays: number) {
    await openRegularDaysQuestion(this);
    await this.pages.numericQuestion.fill('5');
    await this.pages.numericQuestion.continue();
    await expect(this.pages.main).toContainText(new RegExp(`${expectedDays}\\s*days?`, 'i'));
  },
);

When(
  'I change the working-days answer to {int} using the available change control',
  async function (this: TestWorld, days: number) {
    await this.pages.result.changeAnswer('Number of days worked per week?');
    await this.pages.numericQuestion.fill(String(days));
  },
);

Then(
  'the displayed working-days answer should be {int}',
  async function (this: TestWorld, days: number) {
    await expect(this.pages.result.summaryRow('Number of days worked per week?')).toContainText(
      String(days),
    );
  },
);

Given('I have completed a calculation', async function (this: TestWorld) {
  await openRegularDaysQuestion(this);
  await this.pages.numericQuestion.fill('5');
  await this.pages.numericQuestion.continue();
});

When('I use the available restart control', async function (this: TestWorld) {
  await this.pages.result.restartControl.click();
});

Then('a new calculator journey should begin', async function (this: TestWorld) {
  if (await this.pages.landing.startNow.isVisible().catch(() => false)) {
    await this.pages.landing.start();
  }
  await expect(this.pages.workerType.questionHeading).toBeVisible();
});

Then(
  'the previous answers should not affect the new calculation',
  async function (this: TestWorld) {
    await expect(this.pages.workerType.yes).not.toBeChecked();
    await expect(this.pages.workerType.no).not.toBeChecked();
  },
);
