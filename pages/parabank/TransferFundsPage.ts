import { Page } from '@playwright/test';

export class TransferFundsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://parabank.parasoft.com/parabank/transfer.htm');
  }

  async transfer(amount: string, fromAccountId: string, toAccountId: string) {
    await this.page.locator('#amount').fill(amount);
    await this.page.locator('#fromAccountId option').first().waitFor({ state: 'attached' });
    await this.page.locator('#toAccountId option').nth(1).waitFor({ state: 'attached' });
    await this.page.locator('#fromAccountId').selectOption(fromAccountId);
    await this.page.locator('#toAccountId').selectOption(toAccountId);
    await this.page.getByRole('button', { name: 'Transfer' }).click();
  }

  async getConfirmationText(): Promise<string> {
    return (await this.page.locator('#showResult').innerText()).trim();
  }

  async isSuccessful(): Promise<boolean> {
    // ParaBank's public demo is slow/flaky (see README) — wait for the confirmation
    // text instead of a single immediate isVisible() check, which raced the render.
    await this.page.getByText('Transfer Complete!').waitFor({ state: 'visible' });
    return true;
  }
}
