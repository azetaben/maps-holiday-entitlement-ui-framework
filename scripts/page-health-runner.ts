import {Page} from '@playwright/test';
import frameworkConfig from '../config/framework.json';
import {PageFinding} from '../utils/page-health-checks';
import {BrowserManager} from '../support/browser-manager';
import {getTestOptions, loadTestEnvironment} from '../test-options';

loadTestEnvironment();

export type PageCheck = (page: Page) => Promise<PageFinding[]>;

const targets = [
  {
    name: 'Local index.html',
    url: process.env.LOCAL_APP_URL ?? frameworkConfig.urls.localApp,
  },
  {
    name: 'GOV.UK holiday entitlement calculator',
    url: getTestOptions().baseURL,
  },
];

export async function runPageCheck(checkName: string, check: PageCheck): Promise<void> {
  await BrowserManager.launch();
  const context = await BrowserManager.newContext();
  const page = await context.newPage();
  const failures: string[] = [];

  try {
    for (const target of targets) {
      console.log(`\n${checkName}: ${target.name}\n${target.url}`);
      try {
        await page.goto(target.url, {
          waitUntil: 'domcontentloaded',
          timeout: getTestOptions().navigationTimeout,
        });
        const findings = await check(page);
        if (findings.length === 0) {
          console.log('PASS: no issues found.');
          continue;
        }
        for (const finding of findings) {
          const detail = finding.url ? ` (${finding.url})` : '';
          const message = `- ${finding.issue}: ${finding.element}${detail}`;
          console.error(message);
          failures.push(`${target.name}: ${message}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Unable to complete check: ${message}`);
        failures.push(`${target.name}: ${message}`);
      }
    }
  } finally {
    await context.close();
    await BrowserManager.close();
  }

  if (failures.length > 0) {
    console.error(`\n${checkName} found ${failures.length} issue(s).`);
    process.exitCode = 1;
  } else {
    console.log(`\n${checkName} passed for both pages.`);
  }
}
