import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import logger from '../support/logger';

export class DateQuestionPage extends BasePage {
  private readonly dayInput: Locator;
  private readonly monthInput: Locator;
  private readonly yearInput: Locator;

  constructor(page: Page) {
    super(page);
    this.dayInput = page.getByLabel(/day/i).first();
    this.monthInput = page.getByLabel(/month/i).first();
    this.yearInput = page.getByLabel(/year/i).first();
  }

  get day(): Locator {
    return this.dayInput;
  }

  get month(): Locator {
    return this.monthInput;
  }

  get year(): Locator {
    return this.yearInput;
  }

  async fillDate(day: string, month: string, year: string): Promise<void> {
    await this.dayInput.fill(day);
    await this.monthInput.fill(month);
    await this.yearInput.fill(year);
    logger.info('Filled date: %s/%s/%s', day, month, year);
  }

  async clearDate(): Promise<void> {
    await this.dayInput.clear();
    await this.monthInput.clear();
    await this.yearInput.clear();
    logger.info('Cleared date fields');
  }
}
