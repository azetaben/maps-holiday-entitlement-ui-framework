import {DataTable, Given, Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {getTestOptions} from '../test-options';
import {TestWorld} from '../support/world';

Given('I open the holiday entitlement calculator', async function (this: TestWorld) {
  await this.pages.landing.open(getTestOptions().baseURL);
  await this.pages.cookies.rejectAdditionalCookies();
});

Then(
  'the page header should be {string}',
  async function (this: TestWorld, expectedHeader: string) {
    await expect(this.pages.numericQuestion.heading).toHaveText(expectedHeader);
  },
);

Then('I should see {string} header', async function (this: TestWorld, expectedHeader: string) {
  const isLeaveYearQuestion =
    /do you want to (?:work out|calculate) (?:the )?holiday/i.test(expectedHeader);
  const heading = isLeaveYearQuestion
    ? this.pages.leaveYearPeriod.headingWithText(
        /do you want to (?:work out|calculate) (?:the )?holiday/i,
      )
    : this.pages.leaveYearPeriod.headingWithText(expectedHeader);
  await expect(heading).toBeVisible();
});

Then('the page title should be {string}', async function (this: TestWorld, expectedTitle: string) {
  expect(await this.pages.numericQuestion.getTitle()).toBe(expectedTitle);
});

Then('the page url should be {string}', function (this: TestWorld, expectedSlug: string) {
  const pathname = new URL(this.pages.numericQuestion.currentUrl).pathname.replace(/\/+$/, '');
  const slug = expectedSlug.trim().replace(/^\/+|\/+$/g, '');
  expect(pathname).toMatch(new RegExp(`/${escapeRegExp(slug)}$`));
});

Then('the page url should contain {string}', function (this: TestWorld, expectedFragment: string) {
  expect(this.pages.numericQuestion.currentUrl).toContain(expectedFragment);
});

Then(
  'The page breadcrumb should be {string}',
  async function (this: TestWorld, breadcrumb: string) {
    await expect(this.pages.navigation.link(breadcrumb, 'breadcrumb')).toBeVisible();
  },
);

Then(
  'I can see the side widget related content',
  async function (this: TestWorld, links: DataTable) {
    for (const [name] of links.raw()) {
      await expect(this.pages.landing.relatedContentLink(name.trim())).toBeVisible();
    }
  },
);

Then(
  'I should see the following page properties below:',
  async function (this: TestWorld, properties: DataTable) {
    for (const [property] of properties.raw()) {
      const expectedText = property.trim();
      await expect(
        this.pages.numericQuestion.visibleText(expectedText, false).first(),
        `Expected the page to display "${expectedText}".`,
      ).toBeVisible();
    }
  },
);

Then('a calculator answer input should be displayed', async function (this: TestWorld) {
  await expect(this.pages.numericQuestion.mainInput).toBeVisible();
});

When(/^I continue$/, async function (this: TestWorld) {
  await this.pages.numericQuestion.continue();
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
