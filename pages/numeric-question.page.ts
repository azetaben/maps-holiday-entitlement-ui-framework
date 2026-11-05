import {BasePage} from './base/base.page';
import logger from '../support/logger';

export class NumericQuestionPage extends BasePage {
  async fill(value: string): Promise<void> {
    await this.setInputValue(value);
    logger.info('Filled numeric question');
  }

  async clear(): Promise<void> {
    await this.clearInput();
    logger.info('Cleared numeric question');
  }
}
