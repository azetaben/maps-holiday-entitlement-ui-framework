import {expect, Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import {START_NOW_LABEL} from '../test_data/CalculatorContract';
import logger from '../support/logger';

export class LandingPage extends BasePage {
  private readonly header: Locator;
  private readonly introduction: Locator;
  private readonly startButton: Locator;
  private readonly relatedContent: Locator;
  private readonly relatedContentContainer: Locator;
  private readonly exploreTopic: Locator;

  constructor(
    page: Page,
    readonly url: string,
  ) {
    super(page);
    this.header = page.getByRole('heading', {
      name: 'Calculate holiday entitlement',
      exact: true,
      level: 1,
    });
    this.introduction = page.getByText('Use this tool to calculate holiday entitlement for:', {
      exact: true,
    });
    this.relatedContent = page.getByRole('heading', {
      name: 'Related content',
      exact: true,
      level: 2,
    });
    this.relatedContentContainer = page.locator('.gem-c-related-navigation');
    this.startButton = page
      .getByRole('link', { name: START_NOW_LABEL })
      .or(page.getByRole('button', { name: START_NOW_LABEL }));
    this.exploreTopic = page.getByRole('heading', {
      name: 'Explore the topic',
      exact: true,
      level: 2,
    });
  }

  get relatedContentHeader() {
    return this.relatedContent;
  }

  relatedContentLink(name: string): Locator {
    return this.relatedContentContainer.getByRole('link', { name, exact: true });
  }

  get exploreTopicHeader(): Locator {
    return this.exploreTopic;
  }

  get startNow(): Locator {
    return this.startButton;
  }

  get introductionText(): Locator {
    return this.introduction;
  }

  async startNowBounds(): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return this.startButton.boundingBox();
  }

  async screenshotStartNow(): Promise<Buffer> {
    return this.startButton.screenshot();
  }

  async open(
    url = this.url,
    waitUntil: 'load' | 'domcontentloaded' = 'domcontentloaded',
    timeout?: number,
  ): Promise<void> {
    await super.open(url, waitUntil, timeout);
    await expect(this.header).toBeVisible();
    logger.info('Landing page is ready');
  }

  async start(): Promise<void> {
    await this.startButton.click();
    logger.info('Clicked on the Start button');
  }
}
