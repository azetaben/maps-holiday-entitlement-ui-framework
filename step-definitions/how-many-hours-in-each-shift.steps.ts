import {When} from "@cucumber/cucumber";
import {TestWorld} from "../support/world";

When(/^I enter how many hours in each shift "([^"]*)"$/, async function (this: TestWorld, noOfHours: string) {
    await this.pages.hoursInEachShiftPage.enterHowManyHoursInEachShift(noOfHours)

});