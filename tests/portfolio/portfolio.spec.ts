import { test, expect } from '@playwright/test';
import { PortfolioPage } from '../../pages/PortfolioPage';

// E2E suite against my live portfolio (bogdan-carcadea.ro).
// The portfolio tests the portfolio.

test.describe('portfolio smoke', () => {
  test('home renders identity, availability and stats', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    await expect(portfolio.heroName()).toHaveText('Bogdan Carcadea');
    await expect(page.getByText('Open to new QA roles')).toBeVisible();
    // Stats strip renders each label twice (sr-only dt + visible p) — target the dl entries
    await expect(page.locator('dl').getByRole('term').filter({ hasText: 'years in QA' })).toBeAttached();
    await expect(page.locator('dl').getByRole('term').filter({ hasText: 'defects reported' })).toBeAttached();
  });

  test('all main sections are present', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    for (const heading of [
      'How I think about quality',
      'Selected work',
      "Where I've owned quality",
      'How the work breaks down',
      'Get in touch',
    ]) {
      await expect(portfolio.sectionHeading(heading)).toBeVisible();
    }
  });

  test('CV downloads as a PDF', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    const downloadPromise = page.waitForEvent('download');
    await portfolio.cvDownloadLink().click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('projects page lists domain groups', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.gotoProjects();

    await expect(
      page.getByRole('heading', { name: 'Everything I have worked on' }),
    ).toBeVisible();
    await expect(page.getByText('Personal projects', { exact: true })).toBeVisible();
    await expect(page.getByText('Gaming — Ubisoft & EA')).toBeVisible();
  });

  test('external profile links point to the right accounts', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    await expect(page.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      /linkedin\.com\/in\/bogdan-carcadea/,
    );
    await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      /github\.com\/cmbogdan99-dotcom/,
    );
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    const portfolio = new PortfolioPage(page);
    await portfolio.goto();
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });
});
