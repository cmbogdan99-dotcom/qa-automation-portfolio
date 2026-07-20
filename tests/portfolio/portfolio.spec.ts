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
    await expect(page.getByText('Gaming', { exact: true })).toBeVisible();
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

  test('theme toggle switches the data-theme attribute and persists on reload', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    await portfolio.themeToggle().click();

    const expectedTheme = initialTheme === 'light' ? 'dark' : 'light';
    await expect(html).toHaveAttribute('data-theme', expectedTheme);

    // theme is persisted to localStorage — reload and confirm it stuck
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', expectedTheme);
  });

  test('nav Home link points to the site root', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    await expect(portfolio.homeLink()).toHaveAttribute('href', '/');

    await portfolio.homeLink().click();
    await expect(page).toHaveURL('https://bogdan-carcadea.ro/');
  });

  test('gallery card hover reveals DLC sub-cards', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.gotoProjects();

    const card = portfolio.galleryCard("Assassin's Creed Shadows");
    await card.hover();

    await expect(portfolio.dlcItem('Claws of Awaji')).toBeVisible();
  });

  test('CV download button links to the resolved CV PDF path', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    await expect(portfolio.cvDownloadLink()).toHaveAttribute(
      'href',
      '/cv/bogdan-carcadea-cv.pdf',
    );
  });

  test('gallery card external link opens the live app in a new tab', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.gotoProjects();

    const openAppLink = portfolio.externalLinkButton('Open app');
    await expect(openAppLink).toHaveAttribute(
      'href',
      'https://cmbogdan99-dotcom.github.io/dltate/',
    );
    await expect(openAppLink).toHaveAttribute('target', '_blank');
    await expect(openAppLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('LinkedIn and GitHub contact links open in a new tab', async ({ page }) => {
    const portfolio = new PortfolioPage(page);
    await portfolio.goto();

    const linkedin = page.getByRole('link', { name: 'LinkedIn' });
    const github = page.getByRole('link', { name: 'GitHub' });

    await expect(linkedin).toHaveAttribute('target', '_blank');
    await expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(github).toHaveAttribute('target', '_blank');
    await expect(github).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
