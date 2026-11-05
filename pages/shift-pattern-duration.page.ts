import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import logger from '../support/logger';

export class ShiftPatternDurationPage extends BasePage {
    private readonly header: Locator;
    private readonly shiftDurationInputField: Locator;


    constructor(page: Page ) {
        super(page);
        this.header = page.getByText('How many days in the shift pattern?', { exact: true })
        this.shiftDurationInputField = page.getByRole('textbox', { name: 'How many days in the shift pattern?', exact: true })

    }


    get pageContentHeader() {
        return this.header;
    }

    async enterShiftPatternDuration(shiftDurationCount: string) {
        await this.shiftDurationInputField.fill(shiftDurationCount);
        logger.info('Entered shift count', shiftDurationCount);
    }


}
