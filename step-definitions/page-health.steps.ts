import {Given, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import frameworkConfig from '../config/framework.json';
import {getTestOptions} from '../test-options';
import {checkBrokenLinks, checkButtons, checkImages, PageFinding,} from '../utils/page-health-checks';
import {TestWorld} from '../support/world';

function pageHealthTarget(target: string): string {
  switch (target.trim().toLowerCase()) {
    case 'local index.html':
      return process.env.LOCAL_APP_URL ?? frameworkConfig.urls.localApp;
    case 'gov.uk calculator':
      return getTestOptions().baseURL;
    default:
      throw new Error(`Unknown page-health target "${target}".`);
  }
}

async function expectNoFindings(
  world: TestWorld,
  check: (page: TestWorld['page']) => Promise<PageFinding[]>,
): Promise<void> {
  const findings = await check(world.page);
  if (findings.length > 0) {
    const evidence = JSON.stringify(findings, null, 2);
    world.attach(evidence, 'application/json');
    expect(findings, evidence).toEqual([]);
  }
}

Given('the local application is running', async function (this: TestWorld) {
  const response = await this.page.request.get(pageHealthTarget('local index.html'));
  expect(response.ok(), 'The local application must be running before page-health checks.').toBe(
    true,
  );
});

Given('I open {string} for page health checks', async function (this: TestWorld, target: string) {
  await this.page.goto(pageHealthTarget(target), { waitUntil: 'domcontentloaded' });
});

Then('the page should have no broken links', async function (this: TestWorld) {
  await expectNoFindings(this, checkBrokenLinks);
});

Then('the page should have no broken buttons', async function (this: TestWorld) {
  await expectNoFindings(this, checkButtons);
});

Then('the page should have no broken images', async function (this: TestWorld) {
  await expectNoFindings(this, checkImages);
});
