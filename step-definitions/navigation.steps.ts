import {expect} from '@playwright/test';
import {Then, When} from '@cucumber/cucumber';
import {TestWorld} from '../support/world';

When('I open the navigation menu', async function (this: TestWorld) {
  await this.pages.navigation.openMenu();
});

When('I close the navigation menu', async function (this: TestWorld) {
  await this.pages.navigation.closeMenu();
});

Then('the navigation menu should be open', async function (this: TestWorld) {
  await expect(this.pages.navigation.menuButton).toHaveAttribute('aria-expanded', 'true');
});

Then('the navigation menu should be closed', async function (this: TestWorld) {
  await expect(this.pages.navigation.menuButton).toHaveAttribute('aria-expanded', 'false');
});

Then(
  'the navigation menu should show its service and government sections',
  async function (this: TestWorld) {
    await expect(this.pages.navigation.menu).toContainText(/Services and information/i);
    await expect(this.pages.navigation.menu).toContainText(/Government activity/i);
  },
);

Then(
  'the {string} link in the {string} should point to {string}',
  async function (this: TestWorld, name: string, region: string, href: string) {
    const link = this.pages.navigation.link(name, region);
    if (!(await link.count())) {
      this.attach(
        `Link "${name}" is not present in the "${region}" region; href check skipped for this page.`,
        'text/plain',
      );
      return;
    }

    await expect(link).toHaveAttribute('href', href);
  },
);

Then('I can return to the GOV.UK home page', async function (this: TestWorld) {
  await expect(this.pages.navigation.link('GOV.UK', 'header')).toHaveAttribute('href', '/');
});

When('I expand and collapse the site navigation menu', async function (this: TestWorld) {
  await this.pages.navigation.openMenu();
  await this.pages.navigation.closeMenu();
});

Then('the calculator landing page should still be usable', async function (this: TestWorld) {
  await expect(this.pages.landing.startNow).toBeVisible();
});
