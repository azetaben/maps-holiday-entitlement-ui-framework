import {Locator, Page} from '@playwright/test';
import {CONTINUE_LABEL} from '../../test_data/CalculatorContract';
import logger from '../../support/logger';

export abstract class BasePage {
  private readonly mainLocator: Locator;
  private readonly mainInputLocator: Locator;
  private readonly headingLocator: Locator;
  private readonly bodyLocator: Locator;
  private readonly radiosLocator: Locator;
  private readonly mainFormLocator: Locator;
  private readonly resultHeadingLocator: Locator;
  private readonly restartControlLocator: Locator;
  private readonly continueButtonLocator: Locator;
  private readonly errorSummaryLocator: Locator;
  private readonly visibleValidationErrorsLocator: Locator;

  constructor(protected readonly page: Page) {
    this.mainLocator = page.getByRole('main');
    this.mainInputLocator = this.mainLocator
      .getByRole('spinbutton')
      .or(this.mainLocator.getByRole('textbox'))
      .first();
    this.headingLocator = page.getByRole('heading', { level: 1 });
    this.bodyLocator = page.locator('body');
    this.radiosLocator = page.getByRole('radio');
    this.mainFormLocator = page.locator('main form');
    this.resultHeadingLocator = page.getByRole('heading', { name: /result|entitlement/i });
    this.restartControlLocator = page
      .getByRole('link', { name: /start again|restart/i })
      .or(page.getByRole('button', { name: /start again|restart/i }));
    this.continueButtonLocator = page.getByRole('button', {
      name: CONTINUE_LABEL,
      exact: true,
    });
    this.errorSummaryLocator = page.locator('.govuk-error-summary:visible');
    this.visibleValidationErrorsLocator = page.locator(
      '.govuk-error-summary:visible, .govuk-error-message:visible, [role="alert"]:visible',
    );
  }

  get main(): Locator {
    return this.mainLocator;
  }

  get mainInput(): Locator {
    return this.mainInputLocator;
  }

  get heading(): Locator {
    return this.headingLocator;
  }

  get body(): Locator {
    return this.bodyLocator;
  }

  get currentUrl(): string {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  get radios(): Locator {
    return this.radiosLocator;
  }

  get mainForm(): Locator {
    return this.mainFormLocator;
  }

  get resultHeading(): Locator {
    return this.resultHeadingLocator;
  }

  get restartControl(): Locator {
    return this.restartControlLocator;
  }

  get continueButton(): Locator {
    return this.continueButtonLocator;
  }

  get errorSummary(): Locator {
    return this.errorSummaryLocator;
  }

  get visibleValidationErrors(): Locator {
    return this.visibleValidationErrorsLocator;
  }

  labelField(name: string | RegExp): Locator {
    return this.page.getByLabel(name);
  }

  buttonOrLink(name: string | RegExp): Locator {
    return this.page
      .getByRole('button', { name, exact: true })
      .or(this.page.getByRole('link', { name, exact: true }));
  }

  pageLink(name: string | RegExp): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  text(text: string, exact = true): Locator {
    return this.page.getByText(text, { exact });
  }

  visibleText(text: string, exact = true): Locator {
    return this.page.getByText(text, { exact }).filter({ visible: true });
  }

  async buttonColors(locator: Locator): Promise<{ background: number[]; text: number[] }> {
    return locator.evaluate((element) => {
      const style = getComputedStyle(element);
      const channels = (value: string) => value.match(/[\d.]+/g)?.map(Number) ?? [];
      return { background: channels(style.backgroundColor), text: channels(style.color) };
    });
  }

  async contentDimensions(): Promise<{ viewport: number; content: number }> {
    return this.page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
  }

  async navigationTiming(): Promise<{
    responseEndMs: number;
    domContentLoadedMs: number;
    loadEventEndMs: number;
  }> {
    return this.page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (!timing || timing.loadEventEnd <= 0)
        throw new Error('The browser did not report a completed document load.');
      return {
        responseEndMs: timing.responseEnd,
        domContentLoadedMs: timing.domContentLoadedEventEnd,
        loadEventEndMs: timing.loadEventEnd,
      };
    });
  }

  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
    logger.info('Set viewport to %s by %s', width, height);
  }

  async setDocumentZoom(zoom: number): Promise<void> {
    await this.page.evaluate((value) => {
      document.documentElement.style.zoom = String(value);
    }, zoom);
    logger.info('Set document zoom to %s', zoom);
  }

  async isFocused(locator: Locator): Promise<boolean> {
    return locator.evaluate((element) => element === document.activeElement);
  }

  async tabUntilFocused(locator: Locator, attempts = 20): Promise<boolean> {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      if (await this.isFocused(locator)) return true;
      await this.page.keyboard.press('Tab');
    }
    return this.isFocused(locator);
  }

  async tabTo(locator: Locator, attempts = 40): Promise<boolean> {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      if (await this.isFocused(locator)) return this.hasVisibleFocusIndicator(locator);
      await this.page.keyboard.press('Tab');
    }
    return false;
  }

  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
    logger.info('Pressed keyboard key: %s', key);
  }

  async typeKeyboard(value: string): Promise<void> {
    await this.page.keyboard.type(value);
    logger.info('Typed keyboard input');
  }

  async hasVisibleFocusIndicator(locator: Locator): Promise<boolean> {
    return locator.evaluate((element) => {
      const style = getComputedStyle(element);
      return (
        (style.outlineStyle !== 'none' && style.outlineWidth !== '0px') ||
        style.boxShadow !== 'none'
      );
    });
  }

  async clippedInteractiveControlCount(): Promise<number> {
    return this.main.locator(':is(button, input, a, [role="alert"])').evaluateAll(
      (elements) =>
        elements.filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.width > 0 && (rect.left < 0 || rect.right > document.documentElement.clientWidth)
          );
        }).length,
    );
  }

  async refresh(): Promise<void> {
    await this.page.reload();
    logger.info('Reloaded page');
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
    logger.info('Navigated back');
  }

  async goForward(): Promise<void> {
    await this.page.goForward();
    logger.info('Navigated forward');
  }

  async open(
    url: string,
    waitUntil: 'load' | 'domcontentloaded' = 'domcontentloaded',
    timeout?: number,
  ): Promise<void> {
    await this.page.goto(url, { waitUntil, ...(timeout === undefined ? {} : { timeout }) });
    logger.info('Opened page: %s', url);
  }

  async openWithSearchParameter(name: string, value: string): Promise<void> {
    const url = new URL(this.currentUrl);
    url.searchParams.set(name, value);
    await this.open(url.toString());
  }

  async captureLoadDuring(action: () => Promise<void>, timeout: number): Promise<void> {
    const loadEvent = this.page.waitForEvent('load', { timeout });
    await Promise.all([loadEvent, action()]);
  }

  async continue(): Promise<void> {
    await this.clickButton(CONTINUE_LABEL);
  }

  async clickButton(name: string | RegExp): Promise<void> {
    await this.page.getByRole('button', { name }).click();
    logger.info('Clicked %s', name.toString());
  }

  async clickLink(name: string | RegExp): Promise<void> {
    await this.page.getByRole('link', { name }).click();
    logger.info('Clicked %s', name.toString());
  }

  async setInputValue(value: string): Promise<void> {
    await this.mainInput.fill(value);
    logger.info('Filled main input:' + value.toString());
  }

  async clearInput(): Promise<void> {
    await this.mainInput.clear();
    logger.info('Cleared main input');
  }
}
