import {Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {TestWorld} from '../support/world';

When('I leave the numeric answer blank and continue', async function (this: TestWorld) {
  await this.pages.numericQuestion.continue();
});

When('I enter {string}', async function (this: TestWorld, value: string) {
  await this.pages.numericQuestion.fill(value);
});

When('I enter {string} and submit the answer', async function (this: TestWorld, value: string) {
  await this.pages.numericQuestion.fill(value);
  await this.pages.numericQuestion.continue();
});

Then('I should receive a recoverable required-field error', async function (this: TestWorld) {
  await expect(this.pages.numericQuestion.errorSummary).toBeVisible();
});

Then('I should receive a recoverable numeric-entry error', async function (this: TestWorld) {
  await expect(this.pages.numericQuestion.errorSummary).toBeVisible();
  await expect(this.pages.numericQuestion.errorSummary).toContainText(/number|enter/i);
});

Then('I should receive a recoverable invalid-value error', async function (this: TestWorld) {
  await expect(this.pages.numericQuestion.errorSummary).toBeVisible();
});

When('I select calculation basis {string}', async function (this: TestWorld, workBasis: string) {
  await this.pages.regularHours.chooseBasis(workBasis);
});
When(/^I enter "([^"]*)" of hours worked per week$/, async function (hoursCount: string) {
  await this.pages.noOfDaysWorkedPerWeekPage.enterNumberOfHoursWorkedPerWeek(hoursCount);
});
