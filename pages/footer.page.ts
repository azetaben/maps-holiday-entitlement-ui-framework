import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';

export class FooterPage extends BasePage {
  private readonly footerLocator: Locator;
  private readonly feedbackLocator: Locator;

  constructor(page: Page) {
    super(page);
    this.footerLocator = page.getByRole('contentinfo');
    this.feedbackLocator = page.getByText(/is this page useful/i);
  }

  get footer(): Locator {
    return this.footerLocator;
  }

  get feedback(): Locator {
    return this.feedbackLocator;
  }

  link(name: string): Locator {
    return this.footerLocator.getByRole('link', { name, exact: true });
  }
}
