import {When} from '@cucumber/cucumber';

When(/^I fill employment started date "([^"]*)", "([^"]*)" and "([^"]*)" respectively:$/,
    async function (day: string, month: string, year: string) {
    await this.pages.employment_Start_Date.enterEmploymentStartDate(day, month, year)

});