import {Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {TestWorld} from '../support/world';
import {LEAVE_YEAR_PERIOD_OPTIONS} from '../test_data/CalculatorContract';

Then(
  'the entitlement should be {float} {word}',
  async function (this: TestWorld, amount: number, unit: string) {
    const number = Number.isInteger(amount)
      ? String(amount)
      : amount.toFixed(1).replace(/\.0$/, '');
    const singularUnit = unit.replace(/s$/i, '');
    await expect(this.pages.main).toContainText(new RegExp(`${number}\\s*${singularUnit}s?`, 'i'));
  },
);

Then(
  'the calculator shows {int} {word} of leave',
  async function (this: TestWorld, amount: number, unit: string) {
    const singularUnit = unit.replace(/s$/i, '');
    await expect(this.pages.main).toContainText(new RegExp(`${amount}\\s*${singularUnit}s?`, 'i'));
  },
);

When('I select leave year period {string}', async function (this: TestWorld, period: string) {
  await this.pages.leaveYearPeriod.selectPeriodWayThroughLeaveYearOption(period);
});

Then(
  'leave year period {string} should be selected',
  async function (this: TestWorld, period: string) {
    await expect(this.pages.leaveYearPeriod.periodOption(period)).toBeChecked();
  },
);

Then('all four leave year periods should be available', async function (this: TestWorld) {
  await expect(this.pages.leaveYearPeriod.allPeriodRadios).toHaveCount(
    LEAVE_YEAR_PERIOD_OPTIONS.length,
  );
});

Then('no leave year period should be selected', async function (this: TestWorld) {
  for (const { key } of LEAVE_YEAR_PERIOD_OPTIONS) {
    await expect(this.pages.leaveYearPeriod.periodOption(key)).not.toBeChecked();
  }
});
