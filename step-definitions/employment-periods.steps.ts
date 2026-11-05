import {Given, Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {
    CALCULATION_BASIS_OPTIONS,
    LEAVE_YEAR_PERIOD_OPTIONS,
    STATUTORY_MAXIMUM_DAYS,
    WORKER_TYPE_ANSWERS,
} from '../test_data/CalculatorContract';
import {fixtures} from '../test_data/Fixtures';
import {completePartialYear, openWorkerQuestion} from '../support/journey-helpers';
import {TestWorld} from '../support/world';

const fixtureNames = Object.keys(fixtures) as Array<keyof typeof fixtures>;

Given('I use the {string} employment-period fixture', function (this: TestWorld, name: string) {
  if (!fixtureNames.includes(name as keyof typeof fixtures)) {
    throw new Error(
      `Unknown employment-period fixture "${name}". Expected: ${fixtureNames.join(', ')}.`,
    );
  }
  this.testData = fixtures[name as keyof typeof fixtures];
});

When('I calculate their entitlement', async function (this: TestWorld) {
  await completePartialYear(this);
});

Then('it should not exceed the equivalent full-year entitlement', async function (this: TestWorld) {
  const resultText = await this.pages.main.innerText();
  const entitlement = resultText.match(/(?:entitlement|holiday)[^\n]*?([\d.]+)\s+days?/i)?.[1];
  if (!entitlement) throw new Error('Could not find a day entitlement in the result summary.');
  expect(Number(entitlement)).toBeLessThanOrEqual(STATUTORY_MAXIMUM_DAYS);
});

Given(
  'the employee works irregular hours or for part of the year',
  async function (this: TestWorld) {
    await openWorkerQuestion(this);
    await this.pages.workerType.choose(WORKER_TYPE_ANSWERS.irregular.label);
    await this.pages.workerType.continue();
  },
);

When('I enter a leave-year start date of {string}', async function (this: TestWorld, date: string) {
  const parsed = parseEnglishDate(date);
  await this.pages.dateQuestion.fillDate(parsed.day, parsed.month, parsed.year);
});

Then('the calculator shows the {string}', async function (this: TestWorld, expectedPage: string) {
  if (expectedPage.trim().toLowerCase() !== 'pay-period hours question') {
    throw new Error(`Unsupported leave-year follow-up question "${expectedPage}".`);
  }
  await expect(this.pages.numericQuestion.heading).toHaveText(
    'How many hours has the employee worked in the pay period?',
  );
});

Given('a worker is starting part way through a leave year', async function (this: TestWorld) {
  await openWorkerQuestion(this);
  await this.pages.workerType.choose(WORKER_TYPE_ANSWERS.regular.label);
  await this.pages.workerType.continue();
  await this.pages.regularHours.chooseBasis(CALCULATION_BASIS_OPTIONS[0].label);
  await this.pages.regularHours.continue();
  await this.pages.leaveYearPeriod.choosePeriod(LEAVE_YEAR_PERIOD_OPTIONS[1].key);
  await this.pages.leaveYearPeriod.continue();
});

When(
  'their employment and leave-year start dates are both 1 January 2026',
  async function (this: TestWorld) {
    await this.pages.dateQuestion.fillDate('1', '1', '2026');
    await this.pages.dateQuestion.continue();
    await this.pages.dateQuestion.fillDate('1', '1', '2026');
    await this.pages.dateQuestion.continue();
  },
);

Then(
  'the starter route should explain that the leave year must start earlier',
  async function (this: TestWorld) {
    await expect(this.pages.dateQuestion.errorSummary).toBeVisible();
    await expect(this.pages.dateQuestion.errorSummary).toContainText(/before|earlier|start date/i);
  },
);

When('I correct the leave-year start date to 31 December 2025', async function (this: TestWorld) {
  await this.pages.dateQuestion.fillDate('31', '12', '2025');
  await this.pages.dateQuestion.continue();
});

Given("a worker's employment start and end dates are requested", async function (this: TestWorld) {
  await openWorkerQuestion(this);
  await this.pages.workerType.choose(WORKER_TYPE_ANSWERS.regular.label);
  await this.pages.workerType.continue();
  await this.pages.regularHours.chooseBasis(CALCULATION_BASIS_OPTIONS[0].label);
  await this.pages.regularHours.continue();
  await this.pages.leaveYearPeriod.choosePeriod(LEAVE_YEAR_PERIOD_OPTIONS[3].key);
  await this.pages.leaveYearPeriod.continue();
});

When(
  'I enter an employment start date of {string}',
  async function (this: TestWorld, date: string) {
    const parsed = parseEnglishDate(date);
    await this.pages.dateQuestion.fillDate(parsed.day, parsed.month, parsed.year);
    await this.pages.dateQuestion.continue();
  },
);

When(
  'I enter an employment leaving date of {string}',
  async function (this: TestWorld, date: string) {
    const parsed = parseEnglishDate(date);
    await this.pages.dateQuestion.fillDate(parsed.day, parsed.month, parsed.year);
    await this.pages.dateQuestion.continue();
  },
);

Then(
  'the calculator explains that the end date cannot be before the start date',
  async function (this: TestWorld) {
    await expect(this.pages.dateQuestion.errorSummary).toBeVisible();
    await expect(this.pages.dateQuestion.errorSummary).toContainText(/before.*start|after.*start/i);
  },
);

function parseEnglishDate(value: string): { day: string; month: string; year: string } {
  const match = value
    .trim()
    .match(
      /^(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/i,
    );
  if (!match) throw new Error(`Invalid date "${value}". Use a date such as 1 July 2026.`);
  const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];
  const month = months.indexOf(match[2].toLowerCase());
  return { day: match[1], month: String(month + 1), year: match[3] };
}
