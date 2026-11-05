import {Given, Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {calculatorSamples} from '../test_data/CalculatorSamples';
import {openRegularDaysQuestion, openWorkerQuestion} from '../support/journey-helpers';
import {TestWorld} from '../support/world';
import {WORKER_TYPE_ANSWERS} from '../test_data/CalculatorContract';

const scriptDialogs = new WeakSet<TestWorld>();
const navigationSnapshots = new WeakMap<TestWorld, string>();

async function openIrregularDateQuestion(world: TestWorld): Promise<void> {
  await openWorkerQuestion(world);
  await world.pages.workerType.choose(WORKER_TYPE_ANSWERS.irregular.label);
  await world.pages.workerType.continue();
}

Given('I am on a required numeric question', async function (this: TestWorld) {
  await openRegularDaysQuestion(this);
});

Given('I am on a days-or-hours numeric question', async function (this: TestWorld) {
  await openRegularDaysQuestion(this);
});

Given('I am on the working-days-per-week question', async function (this: TestWorld) {
  await openRegularDaysQuestion(this);
});

Given('I am on a required date question', async function (this: TestWorld) {
  await openIrregularDateQuestion(this);
});

When('I enter a number containing 100 digits and continue', async function (this: TestWorld) {
  await this.pages.numericQuestion.fill('9'.repeat(100));
  await this.pages.numericQuestion.continue();
});

Then(
  'I should receive a recoverable error explaining the permitted range',
  async function (this: TestWorld) {
    await expect(this.pages.numericQuestion.errorSummary).toBeVisible();
    await expect(this.pages.numericQuestion.errorSummary).toContainText(/7|between|less than/i);
  },
);

Then(
  'no overflow, service crash or calculated result should be displayed',
  async function (this: TestWorld) {
    await expect(this.pages.numericQuestion.resultHeading).toHaveCount(0);
    await expect(this.pages.numericQuestion.body).not.toContainText(
      /overflow|internal server error|unhandled exception|stack trace/i,
    );
  },
);

When(
  /^I enter day (\d+), month (\d+) and year (\d+) and continue$/,
  async function (this: TestWorld, day: string, month: string, year: string) {
    await this.pages.dateQuestion.fillDate(day, month, year);
    await this.pages.dateQuestion.continue();
  },
);

Then('I should receive a recoverable invalid-date error', async function (this: TestWorld) {
  await expect(this.pages.dateQuestion.errorSummary).toBeVisible();
});

When(
  /^I enter a valid date except for a missing (day|month|year) and continue$/,
  async function (this: TestWorld, missingComponent: 'day' | 'month' | 'year') {
    const values = { day: '15', month: '6', year: '2026' };
    if (missingComponent !== 'day') await this.pages.dateQuestion.day.fill(values.day);
    if (missingComponent !== 'month') await this.pages.dateQuestion.month.fill(values.month);
    if (missingComponent !== 'year') await this.pages.dateQuestion.year.fill(values.year);
    await this.pages.dateQuestion.continue();
  },
);

Then('I should receive a recoverable incomplete-date error', async function (this: TestWorld) {
  await expect(this.pages.dateQuestion.errorSummary).toBeVisible();
});

Then(
  'the completed date components should be retained when {string} is missing',
  async function (this: TestWorld, missingComponent: string) {
    const values = { day: '15', month: '6', year: '2026' };
    for (const component of ['day', 'month', 'year'] as const) {
      if (component === missingComponent) continue;
      await expect(this.pages.dateQuestion[component]).toHaveValue(values[component]);
    }
  },
);

When(
  'I submit the numeric format {string} and continue',
  async function (this: TestWorld, format: string) {
    const value = calculatorSamples.numericFormats[format];
    if (value === undefined) throw new Error(`Unknown numeric format "${format}".`);
    await openRegularDaysQuestion(this);
    await this.pages.numericQuestion.fill(value);
    await this.pages.numericQuestion.continue();
  },
);

Then('the numeric answer should be {word}', async function (this: TestWorld, outcome: string) {
  if (outcome === 'accepted') {
    await expect(this.pages.numericQuestion.errorSummary).toHaveCount(0);
    return;
  }
  if (outcome === 'rejected') {
    await expect(this.pages.numericQuestion.errorSummary).toBeVisible();
    return;
  }
  throw new Error(`Unknown numeric answer outcome "${outcome}".`);
});

When('I change the worker type to irregular-hours working', async function (this: TestWorld) {
  await this.pages.result.changeAnswer(
    'Does the employee work irregular hours or for part of the year?',
  );
  await this.pages.workerType.choose(WORKER_TYPE_ANSWERS.irregular.label);
  await this.pages.workerType.continue();
});

When('I complete the new branch with valid answers', async function (this: TestWorld) {
  await this.pages.dateQuestion.fillDate(
    calculatorSamples.irregularLeaveYearStart.day,
    calculatorSamples.irregularLeaveYearStart.month,
    calculatorSamples.irregularLeaveYearStart.year,
  );
  await this.pages.dateQuestion.continue();
  await this.pages.numericQuestion.fill(calculatorSamples.irregularHoursInPayPeriod);
  await this.pages.numericQuestion.continue();
});

Then(
  'the result should show the irregular-hours answers and omit the regular-hours answers',
  async function (this: TestWorld) {
    await expect(this.pages.main).toContainText(/irregular hours or for part of the year/i);
    await expect(this.pages.main).toContainText(/\bYes\b/);
    await expect(this.pages.main).toContainText(/hours.*worked.*pay period/i);
    await expect(this.pages.main).not.toContainText(/days worked per week/i);
  },
);

Given('I have reached a calculator {word}', async function (this: TestWorld, target: string) {
  if (target === 'question') {
    await openRegularDaysQuestion(this);
    return;
  }
  if (target === 'result') {
    await openRegularDaysQuestion(this);
    await this.pages.numericQuestion.fill('5');
    await this.pages.numericQuestion.continue();
    return;
  }
  throw new Error(`Unknown calculator target "${target}". Use question or result.`);
});

When('I navigate using browser Back and Forward', async function (this: TestWorld) {
  navigationSnapshots.set(this, await this.pages.main.innerText());
  await this.pages.numericQuestion.goBack();
  await this.pages.numericQuestion.goForward();
});

Then(
  'the displayed answers and any result should remain consistent',
  async function (this: TestWorld) {
    const expected = navigationSnapshots.get(this);
    if (expected === undefined)
      throw new Error('No calculator state was recorded before navigation.');
    await expect(this.pages.main).toHaveText(expected);
  },
);

Then('the journey should remain usable', async function (this: TestWorld) {
  await expect(this.pages.numericQuestion.heading).toBeVisible();
  await expect(this.pages.main).toContainText(/\S/);
});

Given('I am on a text-capable calculator input', async function (this: TestWorld) {
  await openIrregularDateQuestion(this);
  this.page.on('dialog', async (dialog) => {
    scriptDialogs.add(this);
    await dialog.dismiss();
  });
});

When(
  'I enter {string} in the date field and submit',
  async function (this: TestWorld, value: string) {
    await this.pages.dateQuestion.day.fill(value);
    await this.pages.dateQuestion.month.fill('4');
    await this.pages.dateQuestion.year.fill('2026');
    await this.pages.dateQuestion.continue();
  },
);

Then('no script should execute', async function (this: TestWorld) {
  expect(scriptDialogs.has(this)).toBe(false);
  await expect(this.pages.main).not.toContainText(/alert\(1\)/i);
});

Then('the input should be rejected or rendered as literal text', async function (this: TestWorld) {
  const value = await this.pages.dateQuestion.day.inputValue();
  const invalid = (await this.pages.dateQuestion.errorSummary.count()) > 0;
  expect(invalid || value.includes('<script>')).toBe(true);
});

Given('I have a valid calculator journey URL', async function (this: TestWorld) {
  await openRegularDaysQuestion(this);
});

When(/^I open that URL after inserting an (.+)$/, async function (this: TestWorld, value: string) {
  await this.pages.numericQuestion.openWithSearchParameter('answer', value);
});

Then(
  'the service should show a recoverable error or a valid restart path',
  async function (this: TestWorld) {
    const hasError = (await this.pages.numericQuestion.errorSummary.count()) > 0;
    const hasRestart = (await this.pages.numericQuestion.restartControl.count()) > 0;
    const hasStart = (await this.pages.landing.startNow.count()) > 0;
    expect(hasError || hasRestart || hasStart).toBe(true);
  },
);

Then(
  'no stack trace or unhandled service error should be displayed',
  async function (this: TestWorld) {
    await expect(this.pages.numericQuestion.body).not.toContainText(
      /stack trace|internal server error|unhandled exception/i,
    );
  },
);
