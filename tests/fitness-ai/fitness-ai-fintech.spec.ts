import { test, expect } from '@playwright/test';
import { FitnessAiPage } from '../../pages/FitnessAiPage';

// Fintech-style precision checks against my own Fitness AI app (dltate) — same
// "does the running total add up exactly" scrutiny as the ParaBank suite,
// applied to this app's own ledgers: hydration liters and the calorie/macro budget.

test.describe('Fitness AI - hydration ledger precision', () => {
  test('sequential water logs sum with exact decimal precision, no floating-point drift', async ({ page }) => {
    const app = new FitnessAiPage(page);
    await app.loginAsGuest();

    await app.logWater(250);
    expect(await app.waterTotalLiters()).toBe(0.25);

    await app.logWater(500);
    expect(await app.waterTotalLiters()).toBe(0.75);

    await app.logWater(750);
    expect(await app.waterTotalLiters()).toBe(1.5);
  });

  test('logging past the daily hydration goal is not clamped — shows the true over-goal total', async ({ page }) => {
    const app = new FitnessAiPage(page);
    await app.loginAsGuest();

    // Goal is 2.6L — four 750ml logs (3.0L) push past it.
    for (let i = 0; i < 4; i++) {
      await app.logWater(750);
    }

    expect(await app.waterTotalLiters()).toBe(3.0);
  });
});

test.describe('Fitness AI - nutrition ledger precision', () => {
  test('adding a generated meal debits the calorie budget and credits macros by exactly its own declared amounts', async ({ page }) => {
    const app = new FitnessAiPage(page);
    await app.loginAsGuest();

    const before = await app.remainingKcal();

    await app.gotoNutrition();
    const meal = await app.nextGeneratedMealMacros();
    const mealKcal = await app.nextGeneratedMealKcal();
    await app.addFirstGeneratedMeal();
    const [protein, carbs, fats] = await app.macroConsumedGrams();

    await app.gotoDashboard();
    const after = await app.remainingKcal();

    expect(after).toBe(before - mealKcal);
    expect(protein).toBe(meal.protein);
    expect(carbs).toBe(meal.carbs);
    expect(fats).toBe(meal.fats);
  });
});
