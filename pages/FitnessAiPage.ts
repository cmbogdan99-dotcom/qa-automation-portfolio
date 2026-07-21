import { Page } from '@playwright/test';

export class FitnessAiPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://cmbogdan99-dotcom.github.io/dltate/');
  }

  async continueAsGuest() {
    await this.page.getByRole('button', { name: 'Continue without account' }).click();
  }

  /**
   * Drives the 5-step onboarding wizard (Personal info -> Body measurements ->
   * Lifestyle -> Goals -> Diet) with sane defaults so tests can reach the
   * authenticated app shell. There is no way to skip onboarding as a guest.
   */
  async completeOnboarding() {
    // Step 1: Personal info
    await this.page.getByPlaceholder('Alex').fill('TestUser');
    await this.page.getByPlaceholder('28').fill('25');
    await this.page.getByRole('button', { name: /Male/ }).click();
    await this.page.getByPlaceholder('175').fill('180');
    await this.page.getByPlaceholder('82').fill('80');
    await this.page.getByRole('button', { name: 'Continua →' }).click();

    // Step 2: Body measurements
    await this.page.getByPlaceholder('37').fill('37');
    await this.page.getByPlaceholder('88').fill('88');
    await this.page.getByRole('button', { name: 'Continua →' }).click();

    // Step 3: Lifestyle
    await this.page.getByRole('button', { name: 'Moderately active' }).click();
    await this.page.getByRole('button', { name: 'Continua →' }).click();

    // Step 4: Goals
    await this.page.getByRole('button', { name: 'Fat loss (-400 kcal)' }).click();
    await this.page.getByPlaceholder('75').fill('72');
    await this.page.getByRole('button', { name: 'Continua →' }).click();

    // Step 5: Diet
    await this.page.getByRole('button', { name: 'Omnivor' }).click();
    await this.page.getByRole('button', { name: 'Creeaza planul meu →' }).click();
  }

  /** Goes through guest login + onboarding to land on the authenticated dashboard. */
  async loginAsGuest() {
    await this.goto();
    await this.continueAsGuest();
    await this.completeOnboarding();
  }

  navButton(name: string) {
    return this.page.getByRole('button', { name });
  }

  themeButton(name: 'Dark' | 'Light') {
    return this.page.getByRole('button', { name, exact: true });
  }

  quickLogFab() {
    return this.page.locator('.qlfab');
  }

  async currentTheme(): Promise<string | null> {
    return this.page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  }
}
