import {expect} from '@playwright/test';
import {DataTable, Then, When} from '@cucumber/cucumber';
import {TestWorld} from '../support/world';

Then('the result page should be displayed', async function (this: TestWorld) {
  await expect(this.pages.result.heading).toBeVisible();
});

Then('I should see the statutory entitlement result', async function (this: TestWorld) {
  await expect(this.pages.main).toContainText(/statutory entitlement/i);
});

Then(
  'the result page should contain {int} changeable answers',
  async function (this: TestWorld, count: number) {
    await expect(this.pages.result.changeLinks).toHaveCount(count);
  },
);

Then('the result page should explain the entitlement guidance', async function (this: TestWorld) {
  await expect(this.pages.main).toContainText(/holiday|leave|entitlement/i);
});

Then('the result should state the capped shift entitlement', async function (this: TestWorld) {
  const mainText = await this.pages.main.innerText();
  expect(mainText).toMatch(/28 shifts/i);
  expect(mainText).toMatch(/5(?:\.0)? hours/i);
  expect(mainText).toMatch(
    /(?:more than 5 shifts?.{0,100}(?:maximum|cap).{0,100}28 shifts|28 shifts?.{0,100}(?:maximum|cap).{0,100}more than 5 shifts?)/i,
  );
});

Then(
  'the employer entitlement guidance should include',
  async function (this: TestWorld, guidance: DataTable) {
    const mainText = await this.pages.main.innerText();
    const guidanceChecks: Array<{ match: RegExp; description: string }> = [
      {
        match:
          /can include (?:bank and public|public and bank) holidays as part of the statutory entitlement/i,
        description: 'bank and public holidays included in statutory leave',
      },
      {
        match: /can (?:give|provide) more paid holiday.{0,100}contractual leave entitlement/i,
        description: 'additional contractual leave',
      },
      {
        match: /must provide holiday pay.{0,60}statutory leave/i,
        description: 'holiday pay during statutory leave',
      },
    ];
    expect(guidance.raw()).toHaveLength(guidanceChecks.length);
    for (const [index, check] of guidanceChecks.entries()) {
      expect(mainText, `Expected employer guidance for ${check.description}.`).toMatch(check.match);
      expect(guidance.raw()[index][0]).toMatch(check.match);
    }
  },
);

Then(
  'the entitlement statement should be {string}',
  async function (this: TestWorld, statement: string) {
    await expect(this.pages.result.entitlementStatement(statement)).toBeVisible();
  },
);

Then(
  'the answer summary should contain {string} with answer {string}',
  async function (this: TestWorld, question: string, answer: string) {
    const row = this.pages.result.summaryRow(question);
    await expect(row).toContainText(answer);
  },
);

When('I change result answer {string}', async function (this: TestWorld, question: string) {
  await this.pages.result.changeAnswer(question);
});
