import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import logger from '../support/logger';

export class LocalAccessibilityPage extends BasePage {
  private readonly formLocator: Locator;
  private readonly contactFieldsLocator: Locator;
  private readonly doneButtonLocator: Locator;
  private readonly illustrationLocator: Locator;

  constructor(page: Page) {
    super(page);
    this.formLocator = page.locator('form').first();
    this.contactFieldsLocator = page.locator('input:visible, textarea:visible, select:visible');
    this.doneButtonLocator = page.getByRole('button', { name: /done/i });
    this.illustrationLocator = page.locator('img:visible').first();
  }

  get form(): Locator {
    return this.formLocator;
  }

  get contactFields(): Locator {
    return this.contactFieldsLocator;
  }

  get doneButton(): Locator {
    return this.doneButtonLocator;
  }

  get illustration(): Locator {
    return this.illustrationLocator;
  }

  async inspectAssets(): Promise<{
    stylesheet: boolean;
    imageLoaded: boolean;
    imageAltAttributePresent: boolean;
  }> {
    const assets = await this.page.evaluate(() => {
      const image = document.querySelector('img');
      return {
        stylesheet: [...document.styleSheets].some((sheet) => sheet.href?.endsWith('/index.css')),
        imageLoaded: Boolean(image?.complete && image.naturalWidth > 0),
        imageAltAttributePresent: image?.hasAttribute('alt') ?? false,
      };
    });
    logger.info('Inspected local accessibility page assets');
    return assets;
  }

  async visibleIllustrationBounds(): Promise<{ x: number; width: number } | null> {
    return this.illustrationLocator
      .boundingBox()
      .then((box) => (box ? { x: box.x, width: box.width } : null));
  }

  async fieldLabelDetails(
    field: Locator,
  ): Promise<{ labelCount: number; labelText: string; placeholder: string }> {
    return field.evaluate((element: HTMLInputElement | HTMLTextAreaElement) => ({
      labelCount: element.labels?.length ?? 0,
      labelText: [...(element.labels ?? [])].map((label) => label.innerText.trim()).join(' '),
      placeholder: element.getAttribute('placeholder') ?? element.tagName.toLowerCase(),
    }));
  }
}
