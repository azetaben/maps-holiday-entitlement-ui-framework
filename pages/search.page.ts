import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import logger from '../support/logger';

export class SearchPage extends BasePage {
  private readonly searchInputLocator: Locator;
  private readonly searchToggleLocator: Locator;
  private readonly searchButtonsLocator: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInputLocator = page.getByRole('combobox', { name: 'Search GOV.UK' });
    this.searchToggleLocator = page.getByRole('button', { name: /search/i }).first();
    this.searchButtonsLocator = page.getByRole('button', { name: /search/i });
  }

  get searchInput(): Locator {
    return this.searchInputLocator;
  }

  async openSearch(): Promise<void> {
    if (await this.searchInputLocator.isVisible().catch(() => false)) return;

    await this.searchToggleLocator.click();
    await this.searchInputLocator.waitFor({ state: 'visible' });
    logger.info('Opened GOV.UK search');
  }

  async closeSearch(): Promise<void> {
    if (!(await this.searchInputLocator.isVisible().catch(() => false))) return;

    await this.searchToggleLocator.click();
    await this.searchInputLocator.waitFor({ state: 'hidden' });
    logger.info('Closed GOV.UK search');
  }

  async search(query: string): Promise<void> {
    await this.openSearch();
    await this.searchInputLocator.fill(query);
    await this.searchButtonsLocator.last().click();
    logger.info('Submitted GOV.UK search');
  }

  async openResult(name: string): Promise<void> {
    await this.searchResult(name).first().click();
    logger.info('Opened search result: %s', name);
  }

  searchResult(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(escapeRegExp(name), 'i') });
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
