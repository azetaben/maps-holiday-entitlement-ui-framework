import {Given, When} from '@cucumber/cucumber';
import {openIrregularHoursQuestion, openRegularDaysQuestion} from '../support/journey-helpers';
import {TestWorld} from '../support/world';

Given(
  'a regular-hours worker works 5 days each week for the full leave year',
  async function (this: TestWorld) {
    await openRegularDaysQuestion(this);
  },
);

When('I calculate holiday entitlement', async function (this: TestWorld) {
  await this.pages.numericQuestion.fill('5');
  await this.pages.numericQuestion.continue();
});

Given(
  'an irregular-hours worker worked 30 hours in a pay period',
  async function (this: TestWorld) {
    await openIrregularHoursQuestion(this, '2026', '4', '1');
  },
);

When('I calculate accrued holiday entitlement', async function (this: TestWorld) {
  await this.pages.numericQuestion.fill('30');
  await this.pages.numericQuestion.continue();
});
