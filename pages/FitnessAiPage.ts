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

  async gotoDashboard() {
    await this.navButton('Dashboard').click();
  }

  async gotoNutrition() {
    await this.navButton('Nutrition & Journal').click();
  }

  /**
   * Hitting an XP milestone (e.g. logging the day's first water/meal) pops a
   * full-screen "New level!" modal that blocks every other control until
   * dismissed. Call this after any logging action before interacting further.
   */
  async dismissLevelUpIfPresent() {
    const continueButton = this.page.getByRole('button', { name: 'Continue', exact: true });
    if (await continueButton.isVisible().catch(() => false)) {
      await continueButton.click();
    }
  }

  async logWater(amount: 250 | 500 | 750) {
    await this.page.getByRole('button', { name: `+${amount}ml` }).click();
    await this.dismissLevelUpIfPresent();
  }

  /** The WATER mini-stat card on the dashboard — always rendered as 2-decimal liters, e.g. "3.00L". */
  async waterTotalLiters(): Promise<number> {
    const card = this.page.locator('.card.cp').filter({ hasText: 'Water' }).first();
    const text = await card.locator('div').nth(1).innerText();
    return parseFloat(text.replace('L', ''));
  }

  /** The "kcal ramase" gauge on the dashboard — present from first load (target) and updates as meals are logged. It's rendered as SVG text, so read via textContent rather than innerText. */
  async remainingKcal(): Promise<number> {
    const card = this.page.locator('.card.cp').filter({ hasText: 'kcal ramase' });
    const text = await card.getByText(/^\d+$/).textContent();
    return Number(text);
  }

  /** kcal badge on the first generated meal in the plan, e.g. "585 kcal". */
  async nextGeneratedMealKcal(): Promise<number> {
    const text = await this.page.getByText(/^\d+ kcal$/).first().innerText();
    return Number(text.replace(' kcal', ''));
  }

  /** Macro summary line on the first generated meal in the plan — "NNg P · NNg C · NNg G". */
  async nextGeneratedMealMacros(): Promise<{ protein: number; carbs: number; fats: number }> {
    const text = await this.page.getByText(/^\d+g P · \d+g C · \d+g G$/).first().innerText();
    const [, protein, carbs, fats] = text.match(/^(\d+)g P · (\d+)g C · (\d+)g G$/)!;
    return { protein: Number(protein), carbs: Number(carbs), fats: Number(fats) };
  }

  async addFirstGeneratedMeal() {
    await this.page.getByRole('button', { name: 'Add', exact: true }).first().click();
    await this.dismissLevelUpIfPresent();
  }

  /** Consumed grams for Protein/Carbs/Fats, in that fixed render order — "NN/NNNg". */
  async macroConsumedGrams(): Promise<number[]> {
    const values = await this.page.getByText(/^\d+\/\d+g$/).allInnerTexts();
    return values.map((v) => Number(v.split('/')[0]));
  }
}
