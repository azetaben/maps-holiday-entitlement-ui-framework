import {Given, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {openIrregularHoursQuestion, openRegularDaysQuestion} from '../support/journey-helpers';
import {TestWorld} from '../support/world';

Given('I am on the {string} question', async function (this: TestWorld, field: string) {
  switch (field.trim().toLowerCase()) {
    case 'working days per week':
      await openRegularDaysQuestion(this);
      return;
    case 'hours worked per pay period':
      await openIrregularHoursQuestion(this);
      return;
    default:
      throw new Error(`Unsupported zero-validation field "${field}".`);
  }
});

Then('zero should be rejected for that field', async function (this: TestWorld) {
  await expect(this.pages.numericQuestion.errorSummary).toBeVisible();
});
