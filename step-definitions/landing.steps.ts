import {Given, Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {TestWorld} from '../support/world';
import {CALCULATOR_NAME} from '../test_data/CalculatorContract';

Then('I should see the calculator introduction', async function (this: TestWorld) {
  await expect(this.pages.landing.heading).toHaveText(CALCULATOR_NAME);
  await expect(this.pages.landing.introductionText).toBeVisible();
});

Then('the page should provide a Start now action', async function (this: TestWorld) {
  await expect(this.pages.landing.startNow).toBeVisible();
});

Then('the Start now button should be visually presented', async function (this: TestWorld) {
  const startNow = this.pages.landing.startNow;
  await expect(startNow).toBeVisible();
  const screenshot = await this.pages.landing.screenshotStartNow();
  const bounds = await this.pages.landing.startNowBounds();
  expect(bounds, 'The Start now control should have a visible rendered box.').not.toBeNull();
  if (!bounds) throw new Error('The Start now control has no rendered bounds.');
  expect(bounds.width).toBeGreaterThan(0);
  expect(bounds.height).toBeGreaterThan(0);
  this.attach(screenshot, {
    mediaType: 'image/png',
    fileName: 'landing-start-now.png',
  });
});

When('I start the calculator', async function (this: TestWorld) {
  await this.pages.landing.start();
});

When('I select Start now', async function (this: TestWorld) {
  await this.pages.landing.start();
});

Then('the landing page should be displayed', async function (this: TestWorld) {
  await expect(this.pages.landing.heading).toHaveText(/calculate holiday entitlement/i);
});
Given('The related content and Explore the topic links are visible',
  async function (this: TestWorld) {
    await expect(this.pages.landing.relatedContentHeader).toHaveText(/Related content/i);
    await expect(this.pages.landing.exploreTopicHeader).toHaveText(/Explore the topic/i);
  });
