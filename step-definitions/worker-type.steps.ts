import {Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {WORKER_TYPE_ANSWERS} from '../test_data/CalculatorContract';
import {TestWorld} from '../support/world';

function workerTypeAnswer(answer: string) {
  const supportedAnswer = Object.values(WORKER_TYPE_ANSWERS).find(
    ({ label }) => label.toLowerCase() === answer.trim().toLowerCase(),
  );
  if (!supportedAnswer) {
    const choices = Object.values(WORKER_TYPE_ANSWERS)
      .map(({ label }) => label)
      .join(' or ');
    throw new Error(`Unsupported worker type "${answer}". Choose ${choices}.`);
  }
  return supportedAnswer.label;
}

Then(
  /^I should be asked whether the employee works irregular hours or for part of the year$/,
  async function (this: TestWorld) {
    await expect(this.pages.workerType.questionHeading).toBeVisible();
  },
);

Then('I should be able to choose Yes or No', async function (this: TestWorld) {
  await expect(this.pages.workerType.yes).toBeVisible();
  await expect(this.pages.workerType.yes).toBeEnabled();
  await expect(this.pages.workerType.no).toBeVisible();
  await expect(this.pages.workerType.no).toBeEnabled();
});

Then(
  /^only (Yes|No) should be selected on the worker type page$/,
  async function (this: TestWorld, selectedAnswer: 'Yes' | 'No') {
    const selected =
      selectedAnswer === 'Yes' ? this.pages.workerType.yes : this.pages.workerType.no;
    const unselected =
      selectedAnswer === 'Yes' ? this.pages.workerType.no : this.pages.workerType.yes;
    await expect(this.pages.workerType.questionHeading).toBeVisible();
    await expect(selected).toBeChecked();
    await expect(unselected).not.toBeChecked();
  },
);

Then(
  'the {string} calculator page should be displayed',
  async function (this: TestWorld, pageName: string) {
    const calculatorPage = this.pages.calculatorPage(pageName);
    await expect(calculatorPage.heading).toBeVisible();

    if (pageName.trim().toLowerCase() === 'irregular hours') {
      expect(this.pages.numericQuestion.currentUrl).toContain('/irregular-hours-and-part-year');
    }
  },
);

Then('the worker-type question should remain unanswered', async function (this: TestWorld) {
  await expect(this.pages.workerType.questionHeading).toBeVisible();
  await expect(this.pages.workerType.yes).not.toBeChecked();
  await expect(this.pages.workerType.no).not.toBeChecked();
});

When('I continue without choosing an answer', async function (this: TestWorld) {
  await this.pages.workerType.continue();
});

Then('I should remain on the worker-type question', async function (this: TestWorld) {
  await expect(this.pages.workerType.questionHeading).toBeVisible();
  await expect(this.pages.workerType.pleaseAnswerQuestionLink).toBeVisible();
});

Then(
  'a required-selection error should identify the unanswered question',
  async function (this: TestWorld) {
    const errorSummary = this.pages.workerType.errorSummary;
    const questionLink = this.pages.workerType.errorSummaryQuestionLink;
    await expect(errorSummary).toBeVisible();
    await expect(errorSummary).toContainText(/please answer this question/i);
    await expect(questionLink).toHaveCount(1);
    await expect(questionLink).toHaveText(/please answer this question/i);

    const target = await questionLink.getAttribute('href');
    if (!target?.startsWith('#')) {
      throw new Error('The required-selection error link does not target the unanswered question.');
    }
    await expect(this.pages.workerType.questionTarget(target.slice(1))).toBeVisible();
  },
);

When(/^I select "([^"]*)"$/, async function (this: TestWorld, answer: string) {
  await this.pages.workerType.choose(workerTypeAnswer(answer));
});

When('I select option {string}', async function (this: TestWorld, answerOption: string) {
  await this.pages.workerType.selectOption(answerOption);
});
When(/^I continue without selecting a worker type$/, async function (this: TestWorld) {
  await this.pages.workerType.continue();
});
