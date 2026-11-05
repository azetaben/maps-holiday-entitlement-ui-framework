import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import logger from '../support/logger';

export class NavigationPage extends BasePage {
  private readonly menuButtonLocator: Locator;
  private readonly menuLocator: Locator;
  private readonly headerRegion: Locator;
  private readonly breadcrumbRegion: Locator;
  private readonly footerRegion: Locator;

  constructor(page: Page) {
    super(page);
    this.menuButtonLocator = page.getByRole('button', { name: /navigation menu/i });
    this.menuLocator = page.getByRole('navigation', { name: /menu/i });
    this.headerRegion = page.locator('header');
    this.breadcrumbRegion = page.getByRole('navigation', { name: /breadcrumb/i });
    this.footerRegion = page.getByRole('contentinfo');
  }

  get menuButton(): Locator {
    return this.menuButtonLocator;
  }

  get menu(): Locator {
    return this.menuLocator;
  }

  link(name: string, region: string): Locator {
    const container = this.region(region);

    // The GOV.UK brand link can expose a logo-only accessible name, so its
    // accessible name is not consistently "GOV.UK" across GOV.UK pages.
    if (region.trim().toLowerCase() === 'header' && /^gov\.uk$/i.test(name.trim())) {
      return container.getByRole('link', {
        name: /GOV\.UK.*homepage|homepage.*GOV\.UK|^GOV\.UK$/i,
      });
    }

    return container.getByRole('link', { name, exact: true });
  }

  async openMenu(): Promise<void> {
    if ((await this.menuButtonLocator.getAttribute('aria-expanded')) !== 'true') {
      await this.menuButtonLocator.click();
      logger.info('Opened navigation menu');
    }
  }

  async closeMenu(): Promise<void> {
    if ((await this.menuButtonLocator.getAttribute('aria-expanded')) === 'true') {
      await this.menuButtonLocator.click();
      logger.info('Closed navigation menu');
    }
  }

  private region(name: string): Locator {
    switch (name.trim().toLowerCase()) {
      case 'header':
        return this.headerRegion;
      case 'breadcrumb':
      case 'breadcrumbs':
        return this.breadcrumbRegion;
      case 'footer':
        return this.footerRegion;
      case 'menu':
      case 'navigation menu':
        return this.menuLocator;
      default:
        throw new Error(
          `Unknown navigation region "${name}". Use header, breadcrumb, footer, or menu.`,
        );
    }
  }
}
