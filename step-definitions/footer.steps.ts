import {expect} from '@playwright/test';
import {Then} from '@cucumber/cucumber';
import {TestWorld} from '../support/world';

Then(
  'the footer should be displayed with licence and copyright information',
  async function (this: TestWorld) {
    await expect(this.pages.footer.footer).toBeVisible();
    await expect(this.pages.footer.footer).toContainText(/copyright/i);
    await expect(this.pages.footer.footer).toContainText(/licence/i);
  },
);

Then(
  'the footer link {string} should point to {string}',
  async function (this: TestWorld, name: string, href: string) {
    await expect(this.pages.footer.link(name)).toHaveAttribute('href', href);
  },
);

Then('the feedback prompt should be in its initial state', async function (this: TestWorld) {
  await expect(this.pages.footer.feedback).toBeVisible();
});
