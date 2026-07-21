import { Page } from '@playwright/test';

export class AccountActivityPage {
  constructor(private page: Page) {}

  async goto(accountId: string) {
    await this.page.goto(`https://parabank.parasoft.com/parabank/activity.htm?id=${accountId}`);
  }

  async getTransactionDescriptions(): Promise<string[]> {
    return await this.page.locator('#transactionTable tbody tr td:nth-child(3)').allInnerTexts();
  }

  async getTransactionAmounts(): Promise<string[]> {
    return await this.page.locator('#transactionTable tbody tr td:nth-child(4)').allInnerTexts();
  }
}
