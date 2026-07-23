import { test, expect } from '@playwright/test';
import { FitnessAiPage } from '../../pages/FitnessAiPage';

test.describe('Fitness AI - app shell', () => {
  test('app loads and renders the login/onboarding entry', async ({ page }) => {
    const app = new FitnessAiPage(page);
    await app.goto();

    await expect(page).toHaveTitle('Dl. Siski — Fitness Tracker');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue without account' })).toBeVisible();
  });

  test('guest onboarding renders the dashboard shell with sidebar nav', async ({ page }) => {
    const app = new FitnessAiPage(page);
    await app.loginAsGuest();

    await expect(app.navButton('Dashboard')).toBeVisible();
    await expect(app.navButton('Nutrition & Journal')).toBeVisible();
    await expect(app.navButton('Exercise')).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI Coach', exact: true })).toBeVisible();
  });
});

test.describe('Fitness AI - theme toggle', () => {
  test('theme toggle switches data-theme and persists across reload', async ({ page }) => {
    const app = new FitnessAiPage(page);
    await app.loginAsGuest();

    expect(await app.currentTheme()).toBe('dark');

    await app.themeButton('Light').click();
    expect(await app.currentTheme()).toBe('light');

    const stored = await page.evaluate(() => localStorage.getItem('dltate:uiTheme'));
    expect(stored).toBe('"light"');

    await page.reload();
    expect(await app.currentTheme()).toBe('light');
  });
});

test.describe('Fitness AI - navigation', () => {
  test('sidebar nav switches between sections', async ({ page }) => {
    const app = new FitnessAiPage(page);
    await app.loginAsGuest();

    await app.navButton('Exercise').click();
    await expect(page.getByRole('heading', { name: 'Sport & workouts' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save workout' })).toBeVisible();

    await app.navButton('Hydration & Sleep').click();
    await expect(page.getByRole('button', { name: 'Save workout' })).toHaveCount(0);
  });
});

test.describe('Fitness AI - quick log', () => {
  test('quick-log FAB opens the quick-add panel', async ({ page }) => {
    const app = new FitnessAiPage(page);
    await app.loginAsGuest();

    const fab = app.quickLogFab();
    await expect(fab).toBeVisible();
    await fab.click();

    await expect(fab).toHaveClass(/open/);
  });
});
