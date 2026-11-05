import {When} from '@cucumber/cucumber';

When(
  /^I fill "([^"]*)", "([^"]*)" and "([^"]*)" respectively:$/,
  async function (day: string, month: string, year: string) {
    await this.pages.workerTypeLeaveYearStartPage.submitLeaveStartDate(day, month, year);
  },
);
