import {Given, Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {COOKIE_UI} from '../test_data/UiContract';
import {getTestOptions} from '../test-options';
import {TestWorld} from '../support/world';

Given('I open the calculator without changing cookie choices', async function (this: TestWorld) {
  await this.pages.landing.open(getTestOptions().baseURL);
  await expect(this.pages.cookies.banner).toBeVisible();
});

Then(
  'the cookie banner should explain essential and optional cookies',
  async function (this: TestWorld) {
    const cookies = this.pages.cookies;
    await expect(cookies.banner).toBeVisible();
    await expect(cookies.bannerLandmark).toBeVisible();
    await expect(cookies.banner).toContainText(COOKIE_UI.essentialCopy);
    await expect(cookies.banner).toContainText(COOKIE_UI.optionalCopy);
    await expect(cookies.banner).toContainText(COOKIE_UI.thirdPartyCopy);
  },
);

Then(
  'the cookie banner should offer actions to accept, reject, or review cookies',
  async function (this: TestWorld) {
    await expect(this.pages.cookies.acceptButton).toBeVisible();
    await expect(this.pages.cookies.rejectButton).toBeVisible();
    await expect(this.pages.cookies.viewCookiesLink).toBeVisible();
  },
);

When('I reject optional cookies', async function (this: TestWorld) {
  await this.pages.cookies.rejectAdditionalCookies();
});

When('I hide cookies message', async function (this: TestWorld) {
  const cookies = this.pages.cookies;
  await expect(cookies.hideButton).toBeVisible();
  await cookies.hideCookiesMessage();
  await expect(cookies.banner).toBeHidden();
});

Then('the banner should confirm that my choice was saved', async function (this: TestWorld) {
  const cookies = this.pages.cookies;
  await expect(cookies.rejectConfirmation).toBeVisible();
  await expect(cookies.rejectConfirmation).toContainText(COOKIE_UI.confirmation);
  await expect(cookies.settingsChangeLink).toHaveAttribute('href', COOKIE_UI.settingsHref);
});

Given('I open cookie settings from the banner', async function (this: TestWorld) {
  await this.pages.cookies.viewCookieSettings();
});

Then('the cookie settings page should be displayed', async function (this: TestWorld) {
  await expect(this.page).toHaveURL(COOKIE_UI.settingsPath);
  await expect(this.page).toHaveTitle(COOKIE_UI.settingsTitle);
  await expect(this.pages.cookies.heading).toHaveText(COOKIE_UI.bannerHeading);
});

Then(
  'I can review the optional cookie categories before saving a choice',
  async function (this: TestWorld) {
    const cookies = this.pages.cookies;
    await expect(cookies.measureCookiesQuestion).toBeVisible();
    await expect(cookies.settingsCookiesQuestion).toBeVisible();
    await expect(cookies.marketingCookiesQuestion).toBeVisible();
    await expect(cookies.rememberHeading).toBeVisible();
    await expect(cookies.marketingHeading).toBeVisible();
    await expect(cookies.necessaryHeading).toBeVisible();
    await expect(cookies.saveChangesButton).toBeVisible();
  },
);

When(
  'I choose {word} for {string}',
  async function (this: TestWorld, choice: string, category: string) {
    await this.pages.cookies.choose(category, choice);
    await expect(this.pages.cookies.choiceRadio(category, choice)).toBeChecked();
  },
);

Then('those cookie choices should be selected', async function (this: TestWorld) {
  for (const question of this.pages.cookies.selectedRadioInQuestions)
    await expect(question).toHaveCount(1);
});

When('I save cookie settings', async function (this: TestWorld) {
  await this.pages.cookies.saveChanges();
});

Then('my cookie choices should be saved successfully', async function (this: TestWorld) {
  await expect(this.pages.cookies.savedHeading).toBeVisible();
});
