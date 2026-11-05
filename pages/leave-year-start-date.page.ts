import {Locator, Page} from '@playwright/test';
import {BasePage} from './base/base.page';

export class LeaveYearStartDatePage extends BasePage {
  private readonly header: Locator;
  private readonly hoursInputField: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.getByText('How many hours has the employee worked in the pay');
    this.hoursInputField = page.getByRole('textbox', {
      name: 'How many hours has the employee worked in the pay period?',
    });
  }

  async enterHours(hoursCount: string) {
    await this.hoursInputField.fill(hoursCount);
  }
}
