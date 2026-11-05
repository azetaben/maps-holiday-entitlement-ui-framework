import {When} from '@cucumber/cucumber';
import {TestWorld} from '../support/world';

When(/^I enter shifts count "([^"]*)"$/, async function (this: TestWorld, shiftCount: string) {
    await this.pages.shiftsPerShiftPatternPage.enterShiftsPerShiftPattern(shiftCount);

});