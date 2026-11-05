import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import logger from '../support/logger';


export class EmploymentStartDatePage extends BasePage {
    private readonly header: Locator;
    private readonly day: Locator;
    private readonly month: Locator;
    private readonly year: Locator;


    constructor( page: Page) {
        super(page);
        this.header = page.getByRole('heading', { name: 'What was the employment start date?', exact: true, level: 1 })
        this.day = page.getByRole('textbox', { name: 'Day', exact: true })
        this.month = page.getByRole('textbox', { name: 'Month', exact: true })
        this.year = page.getByRole('textbox', { name: 'Year', exact: true })
    }


    async enterDay(day:string): Promise<void> {
        await this.day.fill(day)
        logger.info("Entered day " + day)

    }

    async enterMonth(month: string): Promise<void> {
        await this.month.fill(month)
        logger.info("Entered month", month)

    }

    async enterYear(year:string): Promise<void> {
        await this.year.fill(year)
        logger.info("Entered year", year)

    }

    async enterEmploymentStartDate(day:string, month: string, year: string): Promise<void> {
        await this.enterDay(day)
        await this.enterMonth(month)
        await this.enterYear(year)
    }


}

