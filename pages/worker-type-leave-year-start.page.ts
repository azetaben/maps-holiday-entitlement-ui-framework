import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import logger from '../support/logger';

export class WorkerTypeLeaveYearStartPage extends BasePage {
  private readonly header: Locator;
  readonly pageContent: Locator;
  readonly dayDOB: Locator;
  readonly monthDOB: Locator;
  readonly yearDOB: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', {
      name: 'When does the leave year start?',
      exact: true,
      level: 1,
    });
    this.pageContent = page.locator(`.govuk-grid-column-two-thirds`);
    this.dayDOB = page.getByRole('textbox', { name: 'Day', exact: true });
    this.monthDOB = page.getByRole('textbox', { name: 'Month', exact: true });
    this.yearDOB = page.getByRole('textbox', { name: 'Year', exact: true });
  }

  get headerQuestion() {
    return this.header;
  }

  get pageContentQuestion() {
    return this.pageContent;
  }

  async enterDayDOB(day: string) {
    await this.dayDOB.fill(day);
    logger.info("Enter dayDOB", day);
  }

  async enterMonthDOB(month: string) {
    await this.monthDOB.fill(month);
    logger.info("Enter monthDOB", month);
  }

  async enterYearDOB(year: string) {
    await this.yearDOB.fill(year);
    logger.info("Enter yearDOB", year);
  }

  async submitLeaveStartDate(day: string, month: string, year: string) {
    await this.enterDayDOB(day);
    await this.enterMonthDOB(month);
    await this.enterYearDOB(year);
  }
}
