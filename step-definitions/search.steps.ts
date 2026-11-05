import {expect} from '@playwright/test';
import {Given, Then, When} from '@cucumber/cucumber';
import {TestWorld} from '../support/world';

When('I search GOV.UK for {string}', async function (this: TestWorld, query: string) {
  await this.pages.search.search(query);
});

Then('the search results should include {string}', async function (this: TestWorld, title: string) {
  await expect(this.pages.search.searchResult(title).first()).toBeVisible();
});

When('I open the search result {string}', async function (this: TestWorld, title: string) {
  await this.pages.search.openResult(title);
});

Then('the holiday calculator landing page should be displayed', async function (this: TestWorld) {
  await expect(this.pages.landing.heading).toHaveText(/calculate holiday entitlement/i);
});

When('I open site-wide search', async function (this: TestWorld) {
  await this.pages.search.openSearch();
});

When('I close site-wide search', async function (this: TestWorld) {
  await this.pages.search.closeSearch();
});

Then('the site-wide search input should be available', async function (this: TestWorld) {
  await expect(this.pages.search.searchInput).toBeVisible();
});

Given('the site search is available', async function (this: TestWorld) {
  await expect(this.pages.search.searchInput).toBeVisible();
});
