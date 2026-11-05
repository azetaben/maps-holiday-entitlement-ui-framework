import {Given, Then, When} from '@cucumber/cucumber';
import {AxeBuilder} from '@axe-core/playwright';
import {expect, Locator} from '@playwright/test';
import frameworkConfig from '../config/framework.json';
import {calculatorSamples} from '../test_data/CalculatorSamples';
import {
    CONTINUE_LABEL,
    FULL_LEAVE_YEAR_PERIOD,
    REGULAR_WORK_DAYS_BASIS,
    WORKER_TYPE_ANSWERS,
} from '../test_data/CalculatorContract';
import {TestWorld} from '../support/world';

async function advanceToRegularDays(world: TestWorld): Promise<void> {
  if (await world.pages.landing.startNow.count()) await world.pages.landing.start();
  await world.pages.workerType.choose(WORKER_TYPE_ANSWERS.regular.label);
  await world.pages.workerType.continue();
  await world.pages.regularHours.chooseBasis(REGULAR_WORK_DAYS_BASIS);
  await world.pages.regularHours.continue();
  await world.pages.leaveYearPeriod.choosePeriod(FULL_LEAVE_YEAR_PERIOD);
  await world.pages.leaveYearPeriod.continue();
}

async function scanAccessibility(world: TestWorld): Promise<void> {
  const results = await new AxeBuilder({ page: world.page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  world.attach(JSON.stringify(results.violations, null, 2), 'application/json');
  expect(
    results.violations,
    results.violations
      .map((violation) => `${violation.id} (${violation.impact}): ${violation.help}`)
      .join('\n'),
  ).toHaveLength(0);
}

async function scanLocalAccessibility(world: TestWorld): Promise<void> {
  const results = await new AxeBuilder({ page: world.page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  world.attach(JSON.stringify(results.violations, null, 2), 'application/json');
  const findings = results.violations.map(
    (violation) =>
      `${violation.id} [${violation.impact ?? 'unrated'}]: ${violation.help} — ${violation.nodes
        .map((node) => node.target.join(', '))
        .join('; ')}`,
  );
  expect(findings, `Accessibility audit findings:\n${findings.join('\n')}`).toHaveLength(0);
}

async function tabTo(world: TestWorld, target: Locator, description: string): Promise<void> {
  const visible = await world.pages.numericQuestion.tabTo(target);
  if (!(await world.pages.numericQuestion.isFocused(target)))
    throw new Error(`Keyboard tab order did not reach ${description}.`);
  world.keyboardJourney.controls.push(description);
  world.keyboardJourney.visibleIndicators.push(visible);
}

When(
  'I complete a representative {word} journey using only the keyboard',
  async function (this: TestWorld, worker: string) {
    this.keyboardJourney.controls.length = 0;
    this.keyboardJourney.visibleIndicators.length = 0;
    if (await this.pages.landing.startNow.count()) {
      const start = this.pages.landing.startNow;
      await tabTo(this, start, 'Start now');
      await this.pages.landing.pressKey('Enter');
    }
    const yes = this.pages.workerType.yes;
    const no = this.pages.workerType.no;
    const answer = worker === 'regular' ? no : yes;
    // Native radio groups expose one tab stop: focus the first radio, then use
    // the arrow key to move within the group when the second option is needed.
    await tabTo(this, yes, `${worker} worker type`);
    if (worker === 'regular') await this.pages.workerType.pressKey('ArrowDown');
    expect(await this.pages.numericQuestion.isFocused(answer)).toBe(true);
    await this.pages.workerType.pressKey('Space');
    const continueButton = this.pages.numericQuestion.continueButton;
    await tabTo(this, continueButton, CONTINUE_LABEL);
    await this.pages.workerType.pressKey('Enter');
    if (worker === 'regular') {
      const basis = this.pages.regularHours.labelField(new RegExp(REGULAR_WORK_DAYS_BASIS, 'i'));
      await tabTo(this, basis, 'Days worked per week');
      await this.pages.regularHours.pressKey('Space');
      const basisContinue = this.pages.regularHours.continueButton;
      await tabTo(this, basisContinue, 'Continue');
      await this.pages.regularHours.pressKey('Enter');
      const fullYear = this.pages.leaveYearPeriod.periodOption(FULL_LEAVE_YEAR_PERIOD);
      await tabTo(this, fullYear, 'Full leave year');
      await this.pages.leaveYearPeriod.pressKey('Space');
      const periodContinue = this.pages.leaveYearPeriod.continueButton;
      await tabTo(this, periodContinue, 'Continue');
      await this.pages.leaveYearPeriod.pressKey('Enter');
      const days = this.pages.mainInput;
      await tabTo(this, days, 'Working days input');
      await this.pages.numericQuestion.typeKeyboard(calculatorSamples.regularWorkDaysPerWeek);
    } else {
      const day = this.pages.dateQuestion.day;
      await tabTo(this, day, 'Leave year day');
      await this.pages.dateQuestion.typeKeyboard(calculatorSamples.irregularLeaveYearStart.day);
      await this.pages.dateQuestion.pressKey('Tab');
      await this.pages.dateQuestion.typeKeyboard(calculatorSamples.irregularLeaveYearStart.month);
      await this.pages.dateQuestion.pressKey('Tab');
      await this.pages.dateQuestion.typeKeyboard(calculatorSamples.irregularLeaveYearStart.year);
      await this.pages.dateQuestion.pressKey('Tab');
      const next = this.pages.dateQuestion.continueButton;
      await tabTo(this, next, 'Continue');
      await this.pages.dateQuestion.pressKey('Enter');
      const hours = this.pages.mainInput;
      await tabTo(this, hours, 'Hours worked input');
      await this.pages.numericQuestion.typeKeyboard(calculatorSamples.irregularHoursInPayPeriod);
    }
    const finalContinue = this.pages.numericQuestion.continueButton;
    await tabTo(this, finalContinue, 'Continue');
    await this.pages.numericQuestion.pressKey('Enter');
  },
);

Then('all controls should be reachable and operable', async function (this: TestWorld) {
  expect(this.keyboardJourney.controls.length).toBeGreaterThanOrEqual(4);
  await expect(this.pages.numericQuestion.heading).toBeVisible();
});

Then('keyboard focus should be visible and logically ordered', function (this: TestWorld) {
  expect(this.keyboardJourney.controls.length).toBe(this.keyboardJourney.visibleIndicators.length);
  expect(this.keyboardJourney.visibleIndicators.every(Boolean)).toBe(true);
});

Given('the browser is configured for a narrow mobile viewport', async function (this: TestWorld) {
  await this.pages.numericQuestion.setViewport(
    frameworkConfig.browser.narrowViewport.width,
    frameworkConfig.browser.narrowViewport.height,
  );
});

Given('the browser is configured for 400 percent browser zoom', async function (this: TestWorld) {
  await this.pages.numericQuestion.setViewport(
    frameworkConfig.browser.narrowViewport.width,
    frameworkConfig.browser.narrowViewport.height,
  );
  await this.pages.numericQuestion.setDocumentZoom(frameworkConfig.browser.highZoom);
});

When('I complete a journey including an error and a result', async function (this: TestWorld) {
  await advanceToRegularDays(this);
  await this.pages.numericQuestion.continue();
  await expect(this.pages.numericQuestion.errorSummary).toBeVisible();
  await this.pages.numericQuestion.fill(calculatorSamples.regularWorkDaysPerWeek);
  await this.pages.numericQuestion.continue();
});

Then('the content should reflow', async function (this: TestWorld) {
  const dimensions = await this.pages.numericQuestion.contentDimensions();
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});

Then(
  'controls, errors and results should remain usable without clipping',
  async function (this: TestWorld) {
    const clipped = await this.pages.numericQuestion.clippedInteractiveControlCount();
    expect(clipped).toBe(0);
    await expect(this.pages.numericQuestion.heading).toBeVisible();
  },
);

When('I reach the calculator landing page', async function (this: TestWorld) {
  await expect(this.pages.landing.heading).toBeVisible();
});
When('I reach the calculator first question', async function (this: TestWorld) {
  if (await this.pages.landing.startNow.count()) await this.pages.landing.start();
});
When('I reach the calculator validation error', async function (this: TestWorld) {
  await advanceToRegularDays(this);
  await this.pages.numericQuestion.continue();
});
When('I reach the calculator result', async function (this: TestWorld) {
  await advanceToRegularDays(this);
  await this.pages.numericQuestion.fill(calculatorSamples.regularWorkDaysPerWeek);
  await this.pages.numericQuestion.continue();
});
Then(
  'the page should have no automatically detectable WCAG 2.2 AA violations',
  async function (this: TestWorld) {
    await scanAccessibility(this);
  },
);

Given('the local accessibility exercise is open', async function (this: TestWorld) {
  await this.pages.localAccessibility.open(
    process.env.LOCAL_APP_URL ?? frameworkConfig.urls.localApp,
  );
});

When(
  'I complete the local contact fields using only the keyboard',
  async function (this: TestWorld) {
    const fields = this.pages.localAccessibility.contactFields;
    const count = await fields.count();
    expect(count, 'The page should expose the three contact fields.').toBe(3);
    for (let index = 0; index < count; index += 1) {
      const field = fields.nth(index);
      if (!(await this.pages.localAccessibility.tabUntilFocused(field)))
        throw new Error(`Tab navigation did not focus contact field ${index + 1}.`);
      await this.pages.localAccessibility.typeKeyboard(
        index === 0 ? 'Alex Example' : index === 1 ? 'alex@example.test' : 'Accessibility feedback',
      );
    }
    if (
      !(await this.pages.localAccessibility.tabUntilFocused(
        this.pages.localAccessibility.doneButton,
      ))
    )
      throw new Error('Tab navigation did not focus the Done button.');
  },
);

Then('the local Done button should have keyboard focus', async function (this: TestWorld) {
  await expect(this.pages.localAccessibility.doneButton).toBeFocused();
});

Then(
  'the local page should have no automatically detectable WCAG or best-practice violations',
  async function (this: TestWorld) {
    await scanLocalAccessibility(this);
  },
);

Then('the local page assets should have loaded', async function (this: TestWorld) {
  const assets = await this.pages.localAccessibility.inspectAssets();
  expect(assets.stylesheet, 'public/index.css should be loaded.').toBe(true);
  expect(assets.imageLoaded, 'The robot illustration should load successfully.').toBe(true);
});

When('the local viewport is narrowed to 320 CSS pixels', async function (this: TestWorld) {
  await this.pages.numericQuestion.setViewport(
    frameworkConfig.browser.narrowViewport.width,
    frameworkConfig.browser.narrowViewport.height,
  );
});

Then(
  'the local form and illustration should fit without clipping',
  async function (this: TestWorld) {
    const dimensions = await this.pages.localAccessibility.contentDimensions();
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    const rect = await this.pages.localAccessibility.visibleIllustrationBounds();
    expect(rect?.x).toBeGreaterThanOrEqual(0);
    expect((rect?.x ?? 0) + (rect?.width ?? 0)).toBeLessThanOrEqual(
      frameworkConfig.browser.narrowViewport.width,
    );
  },
);

Then(
  'the populated local fields should have visible associated labels',
  async function (this: TestWorld) {
    for (const field of await this.pages.localAccessibility.contactFields.all()) {
      const details = await this.pages.localAccessibility.fieldLabelDetails(field);
      expect(
        details.labelCount,
        `Field "${details.placeholder}" must have a programmatically associated label.`,
      ).toBeGreaterThan(0);
      expect(
        details.labelText.trim(),
        `Field "${details.placeholder}" label must be visible.`,
      ).not.toBe('');
    }
  },
);
