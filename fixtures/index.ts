import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/Login';

type MyFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<MyFixtures>({
  authenticatedPage: async ({ page }: { page: Page }, use: (p: Page) => Promise<void>) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await use(page);
  }
});

export { expect } from '@playwright/test';