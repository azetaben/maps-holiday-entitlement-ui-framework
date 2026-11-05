import {DataTable, Given, Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {CALCULATION_BASIS_HINT, CALCULATION_BASIS_OPTIONS} from '../test_data/CalculatorContract';
import {openWorkerQuestion} from '../support/journey-helpers';
import {TestWorld} from '../support/world';

Given('I start the regular-worker calculation-basis journey', async function (this: TestWorld) {
  await openWorkerQuestion(this);
  await this.pages.workerType.choose('No');
  await this.pages.workerType.continue();
});

When('I answer No to irregular-hours or part-year working', async function (this: TestWorld) {
  await this.pages.workerType.choose('No');
});

When(
  'I change the answer to {string} for {string}',
  async function (this: TestWorld, answer: string, question: string) {
    await this.pages.result.changeAnswer(question);
    await this.pages.workerType.choose(
      answer === 'Yes' || answer === 'No' ? answer : invalidAnswer(answer),
    );
    await this.pages.workerType.continue();
  },
);

When('I follow the {string} link', async function (this: TestWorld, name: string) {
  await this.pages.regularHours.pageLink(name).click();
});

Then(
  'the regular-worker calculation-basis question page should match its complete form contract',
  async function (this: TestWorld) {
    await expect(this.pages.regularHours.heading).toBeVisible();
    await expect(this.pages.regularHours.allBasisRadios).toHaveCount(
      CALCULATION_BASIS_OPTIONS.length,
    );
    for (const { label } of CALCULATION_BASIS_OPTIONS) {
      await expect(this.pages.regularHours.basisOption(label)).toBeVisible();
      await expect(this.pages.regularHours.basisOption(label)).toBeEnabled();
    }
  },
);

Then(
  'the calculation-basis question should present these choices',
  async function (this: TestWorld, choices: DataTable) {
    for (const [label] of choices.raw()) {
      await expect(this.pages.regularHours.basisOption(label.trim())).toBeVisible();
    }
  },
);

Then(
  'the calculation-basis hint should refer to the employment contract',
  async function (this: TestWorld) {
    await expect(this.pages.regularHours.main).toContainText(CALCULATION_BASIS_HINT);
  },
);

Then('the answer summary should show', async function (this: TestWorld, answers: DataTable) {
  for (const { question, answer } of answers.hashes()) {
    await expect(this.pages.result.summaryRow(question)).toContainText(answer);
  }
});

Then('I should see the {string} link', async function (this: TestWorld, name: string) {
  await expect(this.pages.regularHours.pageLink(name)).toBeVisible();
});

Then(
  'I should see a {string} link for {string}',
  async function (this: TestWorld, action: string, question: string) {
    const row = this.pages.result.summaryRow(question);
    await expect(
      row.getByRole('link', { name: new RegExp(`^${escapeRegExp(action)}\\b`, 'i') }),
    ).toBeVisible();
  },
);

Then(
  'calculation basis {string} should be selected on the {string} page',
  async function (this: TestWorld, basis: string, pageName: string) {
    if (pageName.trim().toLowerCase() !== 'regular hours') {
      throw new Error(`Unsupported calculation-basis page "${pageName}".`);
    }
    await expect(this.pages.regularHours.basisOption(basis)).toBeChecked();
  },
);

Then('the journey should continue to the next question', async function (this: TestWorld) {
  await expect(this.pages.numericQuestion.heading).toBeVisible();
  await expect(this.pages.numericQuestion.errorSummary).toHaveCount(0);
  await expect(this.pages.numericQuestion.mainForm).toBeVisible();
});

Then(
  'the leave-year period options should include',
  async function (this: TestWorld, options: DataTable) {
    for (const [label] of options.raw()) {
      await expect(this.pages.leaveYearPeriod.periodOption(label.trim())).toBeVisible();
    }
  },
);

Then(
  'I should see the shift question {string}',
  async function (this: TestWorld, question: string) {
    await expect(this.pages.numericQuestion.heading).toHaveText(question);
  },
);

Then('Your answers are displayed', async function (this: TestWorld) {
  await expect(this.pages.regularHours.yourAnswersHeading).toBeVisible();
  await expect(this.pages.regularHours.yourAnswersSummary).toBeVisible();
});

Then('the shift-pattern duration question should be displayed', async function (this: TestWorld) {
  await expect(this.pages.shiftPatternDurationPage.heading).toHaveText(
    'How many days in the shift pattern?',
  );
});

function invalidAnswer(answer: string): never {
  throw new Error(`Unsupported worker-type answer "${answer}". Expected Yes or No.`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
