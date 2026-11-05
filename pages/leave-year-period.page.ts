import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import {LEAVE_YEAR_PERIOD_OPTIONS} from '../test_data/CalculatorContract';
import logger from '../support/logger';

export class LeaveYearPeriodPage extends BasePage {
  private readonly header: Locator;
  private readonly periodOptionLocators: ReadonlyMap<string, Locator>;
  private readonly periodRadios: Locator;
  private readonly selectedPeriodRadios: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByRole('heading', {
      name: /do you want to (?:work out|calculate) (?:the )?holiday/i,
    });
    this.periodOptionLocators = new Map(
      LEAVE_YEAR_PERIOD_OPTIONS.map(({ key, label }) => [
        key,
        page.getByRole('radio', { name: label, exact: true }),
      ]),
    );
    this.periodRadios = page.getByRole('radio');
    this.selectedPeriodRadios = page.locator('input[type="radio"]:checked');
  }

  get headerQuestion(): Locator {
    return this.header;
  }

  get allPeriodRadios(): Locator {
    return this.periodRadios;
  }
  get selectedPeriodRadiosCount(): Locator {
    return this.selectedPeriodRadios;
  }

  periodOption(period: string): Locator {
    const option = leaveYearPeriodOption(period);
    const locator = this.periodOptionLocators.get(option.key);
    if (!locator)
      throw new Error(`No locator was configured for leave-year period "${option.key}".`);
    return locator;
  }

  async choosePeriod(period: string): Promise<void> {
    const option = leaveYearPeriodOption(period);
    await this.periodOption(option.key).check();
    logger.info('Selected leave-year period: %s', option.label);
  }

  headingWithText(expectedHeader: string | RegExp): Locator {
    return this.page.getByRole('heading', {
      name:
        expectedHeader instanceof RegExp
          ? expectedHeader
          : new RegExp(escapeRegExp(expectedHeader), 'i'),
    });
  }

  async selectPeriodWayThroughLeaveYearOption(period: string) {
    await this.choosePeriod(period);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function leaveYearPeriodOption(period: string) {
  const normalized = period.trim().toLowerCase().replaceAll(' ', '-');
  const option = LEAVE_YEAR_PERIOD_OPTIONS.find(
    ({ key, label, aliases }) =>
      key === normalized ||
      label.toLowerCase() === period.trim().toLowerCase() ||
      aliases.some((alias) => alias.replaceAll(' ', '-') === normalized),
  );
  if (!option) {
    throw new Error(
      `Unknown leave-year period "${period}". Expected one of: ${LEAVE_YEAR_PERIOD_OPTIONS.map(({ key }) => key).join(', ')}.`,
    );
  }
  return option;
}
