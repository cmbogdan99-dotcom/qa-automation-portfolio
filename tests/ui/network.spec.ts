import { test, expect } from '@playwright/test';

test('blocks images and page still loads', async ({ page }) => {
  await page.route('**/*.jpg', route => route.abort());
  await page.route('**/*.png', route => route.abort());

  await page.goto('https://www.saucedemo.com');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Products')).toBeVisible();
});

test('analytics requests are intercepted', async ({ page }) => {
  const intercepted: string[] = [];

  await page.route('**/submit**', route => {
    intercepted.push(route.request().url());
    route.abort();
  });

  await page.goto('https://www.saucedemo.com');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Products')).toBeVisible();
  expect(intercepted.length).toBeGreaterThan(0);
});