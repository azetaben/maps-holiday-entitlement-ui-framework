import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import logger from '../support/logger';

export class HowManyHoursInEachShiftPage extends BasePage {
    private readonly header: Locator;
    private readonly howManyHoursInEachShiftInputField: Locator;


    constructor(page: Page) {
        super(page);
        this.header = page.getByText('How many hours in each shift?', { exact: true });
        this.howManyHoursInEachShiftInputField = page.getByRole('textbox', { name: 'How many hours in each shift?', exact: true });

    }


    get PageContentHeader() {
        return this.header;
    }

    async enterHowManyHoursInEachShift(noOfHours: string){
        await this.howManyHoursInEachShiftInputField.fill(noOfHours);
        logger.info('How many hours in each shift?', noOfHours);
    }


}
