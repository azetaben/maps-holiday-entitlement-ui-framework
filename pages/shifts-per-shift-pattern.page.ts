import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import logger from '../support/logger';

export class ShiftsPerShiftPatternPage extends BasePage {
    private readonly header: Locator;
    private readonly shiftsPerShiftInputField: Locator;


    constructor(page: Page ) {
        super(page);
        this.header = page.getByText('How many shifts will be worked per shift pattern?', { exact: true })
        this.shiftsPerShiftInputField = page.getByRole('textbox', { name: 'How many shifts will be worked per shift pattern?', exact: true })

    }


    get pageContentHeader() {
        return this.header;
    }

    async enterShiftsPerShiftPattern(shiftCount: string) {
        await this.shiftsPerShiftInputField.fill(shiftCount);
        logger.info('Entered shift count', shiftCount);
    }



}
