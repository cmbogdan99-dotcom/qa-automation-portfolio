import { Page } from '@playwright/test';

export class AccountOverviewPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://parabank.parasoft.com/parabank/overview.htm');
  }

  async getAccountIds(): Promise<string[]> {
    // Account rows load async (dojo AJAX) — wait for the first one before reading.
    const links = this.page.locator('#accountTable tbody tr td:first-child a');
    await links.first().waitFor({ state: 'attached' });
    return await links.allInnerTexts();
  }

  async getBalanceForAccount(accountId: string): Promise<string> {
    const row = this.page.locator('#accountTable tbody tr').filter({
      has: this.page.getByRole('link', { name: accountId, exact: true }),
    });
    return (await row.locator('td').nth(1).innerText()).trim();
  }

  async openNewAccount(type: 'CHECKING' | 'SAVINGS', fromAccountId: string): Promise<string> {
    await this.page.goto('https://parabank.parasoft.com/parabank/openaccount.htm');
    // #fromAccountId's <option>s are populated async (dojo), empty right after navigation
    await this.page.locator('#fromAccountId option').first().waitFor({ state: 'attached' });
    await this.page.locator('#type').selectOption(type === 'CHECKING' ? '0' : '1');
    await this.page.locator('#fromAccountId').selectOption(fromAccountId);
    await this.page.getByRole('button', { name: 'Open New Account' }).click();
    await this.page.locator('#newAccountId').waitFor();
    return (await this.page.locator('#newAccountId').innerText()).trim();
  }
}
