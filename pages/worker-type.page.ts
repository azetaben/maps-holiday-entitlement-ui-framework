import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';
import {WORKER_TYPE_ANSWERS, WORKER_TYPE_QUESTION} from '../test_data/CalculatorContract';
import logger from '../support/logger';

export type WorkerTypeAnswer =
  (typeof WORKER_TYPE_ANSWERS)[keyof typeof WORKER_TYPE_ANSWERS]['label'];

export class WorkerTypePage extends BasePage {
  private readonly questionHeadingLocator: Locator;
  private readonly yesRadio: Locator;
  private readonly noRadio: Locator;
  private readonly pleaseAnswerQuestion: Locator;
  private readonly questionText: string;

  constructor(page: Page) {
    super(page);
    this.questionText = WORKER_TYPE_QUESTION;
    this.questionHeadingLocator = page.getByRole('heading', {
      name: this.questionText,
      exact: true,
    });
    this.yesRadio = page.getByRole('radio', { name: WORKER_TYPE_ANSWERS.irregular.label });
    this.noRadio = page.getByRole('radio', { name: WORKER_TYPE_ANSWERS.regular.label });
    this.pleaseAnswerQuestion = page.getByRole('link', { name: 'Please answer this question' });
  }

  get questionHeading(): Locator {
    return this.questionHeadingLocator;
  }

  get yes(): Locator {
    return this.yesRadio;
  }

  get no(): Locator {
    return this.noRadio;
  }

  get pleaseAnswerQuestionLink(): Locator {
    return this.pleaseAnswerQuestion;
  }

  questionHeadingFor(name: string | RegExp): Locator {
    return this.page.getByRole('heading', { name });
  }

  formForQuestion(heading: Locator): Locator {
    return this.page.locator('form').filter({ has: heading });
  }

  questionTarget(id: string): Locator {
    return this.page.locator(`[id="${id.replaceAll('"', '\\"')}"]`);
  }

  radioChoices(form: Locator): Locator {
    return form.getByRole('radio');
  }

  radioChoice(form: Locator, name: string): Locator {
    return form.getByRole('radio', { name, exact: true });
  }

  get errorSummaryQuestionLink(): Locator {
    return this.errorSummary.getByRole('link');
  }

  async choose(answer: WorkerTypeAnswer): Promise<void> {
    await this.questionHeadingLocator.waitFor({ state: 'visible' });
    const answerRadio =
      answer === WORKER_TYPE_ANSWERS.irregular.label ? this.yesRadio : this.noRadio;
    await answerRadio.check();
    logger.info('Selected worker type: %s', answer);
  }

  async selectOption(answerOption: string) {
    const response0Radio = this.page.getByRole('radio', {
      name: answerOption,
      exact: true,
      checked: false,
    });
    await response0Radio.click({ force: true });
  }

  async getPleaseAnswerQuestionText() {
    await this.questionHeadingLocator.waitFor({ state: 'visible' });
    return await this.pleaseAnswerQuestion.textContent();
  }
}
