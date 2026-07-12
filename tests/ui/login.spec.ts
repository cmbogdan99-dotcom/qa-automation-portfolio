import { expect } from '@playwright/test';
import { test } from '../../fixtures/index';

test('successful login redirects to inventory page', async ({ authenticatedPage }) => {
  await expect(authenticatedPage).toHaveURL('https://www.saucedemo.com/inventory.html');
  await expect(authenticatedPage.getByText('Products')).toBeVisible();
});

const invalidCredentials = [
  { username: 'standard_user', password: 'wrong_password', description: 'wrong password' },
  { username: 'locked_out_user', password: 'secret_sauce', description: 'locked out user' },
  { username: '', password: 'secret_sauce', description: 'empty username' },
  { username: 'standard_user', password: '', description: 'empty password' },
];

for (const { username, password, description } of invalidCredentials) {
  test(`login fails with ${description}`, async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Swag Labs')).toBeVisible();
  });
}