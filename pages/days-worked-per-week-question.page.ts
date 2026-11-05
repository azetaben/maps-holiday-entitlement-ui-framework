import {BasePage} from "./base/base.page";
import {Locator, Page} from "@playwright/test";
import logger from "../support/logger";

export class DaysWorkedPerWeekQuestionPage extends BasePage {
    private readonly header: Locator;

    constructor(page: Page) {
        super(page);
        this.header = page.getByRole('heading', {name: 'Is the holiday entitlement based on:'})
    }

    async selectEmploymentContractHolidayEntitlementBased(workBasis: string) {
        await this.page.getByText(workBasis, { exact: true }).first().visible().click({force: true});
        logger.info("Selected " + workBasis);

    }
}

