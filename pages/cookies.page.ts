import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import {COOKIE_UI} from '../test_data/UiContract';
import logger from '../support/logger';

type CookieCategory = keyof typeof COOKIE_UI.choices;

export class CookiesPage extends BasePage {
  private readonly bannerLocator: Locator;
  private readonly acceptButtonLocator: Locator;
  private readonly rejectButtonLocator: Locator;
  private readonly viewCookiesLinkLocator: Locator;
  private readonly rejectConfirmationLocator: Locator;
  private readonly saveChangesButtonLocator: Locator;
  private readonly measureCookiesQuestionLocator: Locator;
  private readonly settingsCookiesQuestionLocator: Locator;
  private readonly marketingCookiesQuestionLocator: Locator;
  private readonly bannerLandmarkLocator: Locator;
  private readonly rememberHeadingLocator: Locator;
  private readonly marketingHeadingLocator: Locator;
  private readonly necessaryHeadingLocator: Locator;
  private readonly savedHeadingLocator: Locator;
  private readonly settingsChangeLinkLocator: Locator;
  private readonly cookieChoiceRadiosLocator: Locator;
  private readonly selectedRadioInQuestionsLocators: Locator[];
  private readonly hideButtonLocator: Locator;

  constructor(page: Page) {
    super(page);
    this.bannerLocator = page.locator('#global-cookie-message');
    this.acceptButtonLocator = this.bannerLocator.getByRole('button', {
      name: COOKIE_UI.accept,
      exact: true,
    });
    this.rejectButtonLocator = this.bannerLocator.getByRole('button', {
      name: COOKIE_UI.reject,
      exact: true,
    });
    this.viewCookiesLinkLocator = this.bannerLocator.getByRole('link', {
      name: COOKIE_UI.view,
      exact: true,
    });
    this.rejectConfirmationLocator = this.bannerLocator.locator(
      '.gem-c-cookie-banner__confirmation-message--rejected',
    );
    this.saveChangesButtonLocator = page.getByRole('button', {
      name: COOKIE_UI.save,
      exact: true,
    });
    this.measureCookiesQuestionLocator = page.getByRole('group', {
      name: COOKIE_UI.categories.measure,
    });
    this.settingsCookiesQuestionLocator = page.getByRole('group', {
      name: COOKIE_UI.categories.settings,
    });
    this.marketingCookiesQuestionLocator = page.getByRole('group', {
      name: COOKIE_UI.categories.marketing,
    });
    this.bannerLandmarkLocator = page.getByRole('region', { name: COOKIE_UI.bannerHeading });
    this.rememberHeadingLocator = page.getByRole('heading', { name: COOKIE_UI.rememberHeading });
    this.marketingHeadingLocator = page.getByRole('heading', { name: COOKIE_UI.marketingHeading });
    this.necessaryHeadingLocator = page.getByRole('heading', { name: COOKIE_UI.necessaryHeading });
    this.savedHeadingLocator = page.getByRole('heading', { name: COOKIE_UI.savedHeading });
    this.settingsChangeLinkLocator = this.rejectConfirmationLocator.getByRole('link', {
      name: COOKIE_UI.settingsLink,
    });
    this.cookieChoiceRadiosLocator = page.getByRole('radio');
    this.selectedRadioInQuestionsLocators = [
      this.measureCookiesQuestionLocator,
      this.settingsCookiesQuestionLocator,
      this.marketingCookiesQuestionLocator,
    ].map((question) => question.locator('input[type="radio"]:checked'));
    this.hideButtonLocator = this.bannerLocator.getByRole('button', {
      name: COOKIE_UI.hide,
      exact: true,
    });
  }

  get banner(): Locator {
    return this.bannerLocator;
  }

  get acceptButton(): Locator {
    return this.acceptButtonLocator;
  }

  get rejectButton(): Locator {
    return this.rejectButtonLocator;
  }

  get viewCookiesLink(): Locator {
    return this.viewCookiesLinkLocator;
  }

  get rejectConfirmation(): Locator {
    return this.rejectConfirmationLocator;
  }

  get saveChangesButton(): Locator {
    return this.saveChangesButtonLocator;
  }

  get measureCookiesQuestion(): Locator {
    return this.measureCookiesQuestionLocator;
  }

  get settingsCookiesQuestion(): Locator {
    return this.settingsCookiesQuestionLocator;
  }

  get marketingCookiesQuestion(): Locator {
    return this.marketingCookiesQuestionLocator;
  }

  get bannerLandmark(): Locator {
    return this.bannerLandmarkLocator;
  }

  get rememberHeading(): Locator {
    return this.rememberHeadingLocator;
  }

  get marketingHeading(): Locator {
    return this.marketingHeadingLocator;
  }

  get necessaryHeading(): Locator {
    return this.necessaryHeadingLocator;
  }

  get savedHeading(): Locator {
    return this.savedHeadingLocator;
  }

  get settingsChangeLink(): Locator {
    return this.settingsChangeLinkLocator;
  }

  get cookieChoiceRadios(): Locator {
    return this.cookieChoiceRadiosLocator;
  }

  get selectedRadioInQuestions(): Locator[] {
    return this.selectedRadioInQuestionsLocators;
  }

  get hideButton(): Locator {
    return this.hideButtonLocator;
  }

  choiceRadio(category: string, choice: string): Locator {
    const key = this.categoryKey(category);
    if (choice !== 'allow' && choice !== 'reject')
      throw new Error(`Unsupported cookie choice: "${choice}".`);
    return this.page.getByRole('radio', { name: COOKIE_UI.choices[key][choice], exact: true });
  }

  async rejectAdditionalCookies(): Promise<void> {
    await this.rejectButtonLocator.click();
    logger.info('Rejected optional cookies');
  }

  async viewCookieSettings(): Promise<void> {
    await this.viewCookiesLinkLocator.click();
    logger.info('Opened cookie settings');
  }

  async choose(category: string, choice: string): Promise<void> {
    await this.choiceRadio(category, choice).check();
    logger.info('Selected %s cookie choice for %s', choice, category);
  }

  async saveChanges(): Promise<void> {
    await this.saveChangesButtonLocator.click();
    logger.info('Saved cookie settings');
  }

  async hideCookiesMessage(): Promise<void> {
    await this.hideButtonLocator.click();
    logger.info('Hide cookie message');
  }

  private categoryKey(category: string): CookieCategory {
    const normalized = category.toLowerCase();
    if (/measure|analytics|website use/.test(normalized)) return 'measure';
    if (/remember|settings/.test(normalized)) return 'settings';
    if (/communication|marketing|campaign/.test(normalized)) return 'marketing';
    throw new Error(`Unknown cookie category: "${category}".`);
  }
}
