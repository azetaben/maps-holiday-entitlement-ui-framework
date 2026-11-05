import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import logger from '../support/logger';

export class ResultPage extends BasePage {
  private readonly changeLinksLocator: Locator;
  private readonly answerRows: Locator;

  constructor(page: Page) {
    super(page);
    this.changeLinksLocator = page.getByRole('link', { name: /change/i });
    this.answerRows = page.locator('li, tr, .govuk-summary-list__row');
  }

  entitlementStatement(statement: string): Locator {
    return this.page.getByText(statement, { exact: true });
  }

  summaryRow(question: string): Locator {
    return this.page.locator('.govuk-summary-list__row').filter({
      has: this.page.getByText(question, { exact: true }),
    });
  }

  summaryKey(row: Locator): Locator {
    return row.locator('.govuk-summary-list__key');
  }
  summaryValue(row: Locator): Locator {
    return row.locator('.govuk-summary-list__value');
  }

  summaryAction(row: Locator, action: string): Locator {
    return row.getByRole('link', { name: new RegExp(action, 'i') });
  }

  visuallyHiddenText(locator: Locator): Locator {
    return locator.locator('.govuk-visually-hidden');
  }

  get changeLinks(): Locator {
    return this.changeLinksLocator;
  }

  async changeAnswer(question: string): Promise<void> {
    await this.answerRows
      .filter({ hasText: question })
      .getByRole('link', { name: /change/i })
      .click();
    logger.info('Opened change action for answer: %s', question);
  }
}
