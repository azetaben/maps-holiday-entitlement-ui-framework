import {When} from '@cucumber/cucumber';
import {TestWorld} from '../support/world';

When(/^I enter daily duration shift as "([^"]*)"$/, async function (this: TestWorld, shiftDurationCount: string) {
    await this.pages.shiftPatternDurationPage.enterShiftPatternDuration(shiftDurationCount);

});