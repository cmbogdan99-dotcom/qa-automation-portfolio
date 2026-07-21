import { Page } from '@playwright/test';

export class RegisterPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://parabank.parasoft.com/parabank/register.htm');
  }

  async register(user: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    ssn: string;
    username: string;
    password: string;
  }) {
    await this.page.locator('#customer\\.firstName').fill(user.firstName);
    await this.page.locator('#customer\\.lastName').fill(user.lastName);
    await this.page.locator('#customer\\.address\\.street').fill(user.street);
    await this.page.locator('#customer\\.address\\.city').fill(user.city);
    await this.page.locator('#customer\\.address\\.state').fill(user.state);
    await this.page.locator('#customer\\.address\\.zipCode').fill(user.zipCode);
    await this.page.locator('#customer\\.phoneNumber').fill(user.phone);
    await this.page.locator('#customer\\.ssn').fill(user.ssn);
    await this.page.locator('#customer\\.username').fill(user.username);
    await this.page.locator('#customer\\.password').fill(user.password);
    await this.page.locator('#repeatedPassword').fill(user.password);
    await this.page.getByRole('button', { name: 'Register' }).click();
    await Promise.race([
      this.page.getByRole('heading', { name: /Welcome/ }).waitFor(),
      this.page.locator('.error').first().waitFor(),
    ]);
  }

  async getErrorMessages(): Promise<string[]> {
    return await this.page.locator('.error').allInnerTexts();
  }
}
