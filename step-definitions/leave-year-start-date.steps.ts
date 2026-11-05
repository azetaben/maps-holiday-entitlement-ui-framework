import {Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {TestWorld} from '../support/world';

When(
  /^I enter (-?\d+(?:\.\d+)?) hours work in the pay period$/,
  async function (this: TestWorld, hourCount: string) {
    await this.pages.leaveYearStartDatePage.enterHours(hourCount);
  },
);

Then('the leave-year start date should be rejected', async function (this: TestWorld) {
  await expect(this.pages.workerTypeLeaveYearStartPage.errorSummary).toBeVisible();
});

Then('the pay-period hours should be rejected', async function (this: TestWorld) {
  await expect(this.pages.leaveYearStartDatePage.errorSummary).toBeVisible();
});
