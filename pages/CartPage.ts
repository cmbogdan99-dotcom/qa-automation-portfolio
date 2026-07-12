import { Page } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  async getItemNames(): Promise<string[]> {
    return await this.page.locator('.inventory_item_name').allInnerTexts();
  }

  async removeItemByName(productName: string) {
    const item = this.page.locator('.cart_item').filter({ hasText: productName });
    await item.getByRole('button', { name: 'Remove' }).click();
  }

  async proceedToCheckout() {
    await this.page.getByRole('button', { name: 'Checkout' }).click();
  }
}