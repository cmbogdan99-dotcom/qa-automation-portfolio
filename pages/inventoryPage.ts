import { Page } from '@playwright/test';

export class InventoryPage {
  constructor(private page: Page) {}

  async addToCartByName(productName: string) {
    await this.page.getByText(productName).first().click();
    await this.page.getByRole('button', { name: 'Add to cart' }).click();
    await this.page.goBack();
  }

  async getCartBadgeCount(): Promise<string> {
    return await this.page.locator('.shopping_cart_badge').innerText();
  }

  async goToCart() {
    await this.page.locator('.shopping_cart_link').click();
  }
}