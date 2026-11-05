import {Given, When} from '@cucumber/cucumber';
import {openIrregularHoursQuestion} from '../support/journey-helpers';
import {TestWorld} from '../support/world';

Given(
  'I am calculating irregular-hours accrual for a leave year beginning on 1 April 2026',
  async function (this: TestWorld) {
    await openIrregularHoursQuestion(this, '2026', '4', '1');
  },
);

When(
  'I enter {float} hours worked in one pay period and complete the calculation',
  async function (this: TestWorld, hoursWorked: number) {
    await this.pages.numericQuestion.fill(String(hoursWorked));
    await this.pages.numericQuestion.continue();
  },
);
