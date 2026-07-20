import { Page } from '@playwright/test';

export class PortfolioPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://bogdan-carcadea.ro');
  }

  async gotoProjects() {
    await this.page.goto('https://bogdan-carcadea.ro/projects');
  }

  heroName() {
    return this.page.getByRole('heading', { level: 1 });
  }

  navLink(name: string) {
    return this.page.getByRole('navigation').getByRole('link', { name });
  }

  cvDownloadLink() {
    return this.page.getByRole('link', { name: 'Download CV' });
  }

  sectionHeading(text: string) {
    return this.page.getByRole('heading', { name: text });
  }

  homeLink() {
    return this.page.getByRole('link', { name: 'Home' });
  }

  themeToggle() {
    return this.page.getByRole('button', { name: 'Toggle theme' });
  }

  galleryCard(name: string) {
    return this.page.locator('article').filter({ hasText: name });
  }

  dlcItem(name: string) {
    return this.page.getByText(name, { exact: true });
  }

  externalLinkButton(label: string) {
    return this.page.getByRole('link', { name: new RegExp(label) });
  }
}
