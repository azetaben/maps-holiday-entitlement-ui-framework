import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';

export class NumberOfDaysWorkedPerWeekPage extends BasePage {
    private readonly header: Locator;
    private readonly pageContent: Locator;
    private readonly noOfDaysWorkedPerWeekInputField: Locator;



    constructor(page: Page) {
        super(page);
        this.header = page.getByText('Number of hours worked per week?', { exact: true });
        this.pageContent = page.getByText('Number of hours worked per week?        Include ha');
        this.noOfDaysWorkedPerWeekInputField = page.getByRole('textbox', { name: 'Number of hours worked per week?', exact: true })

    }

    get pageContentText(): Locator {
        return this.pageContent;
    }

    async enterNumberOfHoursWorkedPerWeek(hourCount: string): Promise<void> {
        await this.noOfDaysWorkedPerWeekInputField.fill(hourCount);

    }


}


