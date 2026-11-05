import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import {CALCULATION_BASIS_OPTIONS} from '../test_data/CalculatorContract';
import logger from '../support/logger';

export class RegularHoursPage extends BasePage {
  private readonly basisOptionLocators: ReadonlyMap<string, Locator>;
  private readonly basisRows: Locator;
  private readonly basisRadios: Locator;
  private readonly selectedBasisRadios: Locator;
  private readonly answersHeading: Locator;
  private readonly answersSummary: Locator;
  private readonly answerRows: Locator;
  private readonly answersDescription: Locator;
  private readonly startAgainLink: Locator;
  private readonly workerAnswerSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.basisOptionLocators = new Map(
      CALCULATION_BASIS_OPTIONS.map(({ label }) => [
        label.toLowerCase(),
        page.getByLabel(new RegExp(escapeRegExp(label), 'i')),
      ]),
    );
    this.basisRows = page.locator('.govuk-summary-list__row, tr');
    this.basisRadios = page.getByRole('radio');
    this.selectedBasisRadios = page.locator('input[type="radio"]:checked');
    this.answersHeading = page.getByRole('heading', { name: 'Your answers', exact: true });
    this.answersSummary = page.locator('.govuk-summary-list');
    this.answerRows = this.answersSummary.locator('.govuk-summary-list__row');
    this.answersDescription = page.locator('p.govuk-body');
    this.startAgainLink = page.getByRole('link', { name: 'Start again', exact: true });
    this.workerAnswerSummary = page.locator('.gem-c-summary-list--wide-title .govuk-summary-list');
  }

  get allBasisRadios(): Locator {
    return this.basisRadios;
  }
  get selectedBasisRadiosCount(): Locator {
    return this.selectedBasisRadios;
  }
  get yourAnswersHeading(): Locator {
    return this.answersHeading;
  }
  get yourAnswersSummary(): Locator {
    return this.answersSummary;
  }
  get yourAnswerRows(): Locator {
    return this.answerRows;
  }
  get description(): Locator {
    return this.answersDescription;
  }
  get startAgain(): Locator {
    return this.startAgainLink;
  }
  get priorAnswerSummary(): Locator {
    return this.workerAnswerSummary;
  }
  get priorAnswerRows(): Locator {
    return this.workerAnswerSummary.locator('.govuk-summary-list__row');
  }

  questionHeading(name: string): Locator {
    return this.main.getByRole('heading', { level: 1, name, exact: true });
  }

  basisOption(basis: string): Locator {
    const option = calculationBasisOption(basis);
    const locator = this.basisOptionLocators.get(option.label.toLowerCase());
    if (!locator) throw new Error(`No locator was configured for calculation basis "${basis}".`);
    return locator;
  }

  async chooseBasis(basis: string): Promise<void> {
    await this.basisOption(basis).check();
    logger.info('Selected calculation basis: %s', basis);
  }

  async changeBasis(basis: string): Promise<void> {
    const option = calculationBasisOption(basis);
    const basisRow = this.basisRows.filter({
      hasText: new RegExp(escapeRegExp(option.label), 'i'),
    });
    await basisRow
      .getByRole('link', { name: /change/i })
      .first()
      .click();
    logger.info('Opened change action for calculation basis: %s', basis);
  }

  async chooseHolidayEntitlementBased(basis: string) {
    await this.page.getByLabel(basis, {exact: true}).first().click({force: true});
    logger.info("Selected " +basis);
  }
}

function calculationBasisOption(basis: string) {
  const option = CALCULATION_BASIS_OPTIONS.find(
    ({ label }) => label.toLowerCase() === basis.trim().toLowerCase(),
  );
  if (!option) {
    throw new Error(
      `Unknown calculation basis "${basis}". Expected one of: ${CALCULATION_BASIS_OPTIONS.map(({ label }) => label).join(', ')}.`,
    );
  }
  return option;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
