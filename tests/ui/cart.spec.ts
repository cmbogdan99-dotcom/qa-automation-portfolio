import { test, expect } from '../../fixtures/index';
import { InventoryPage } from '../../pages/inventoryPage';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test('cart badge updates when product is added', async ({ authenticatedPage }) => {
  const inventory = new InventoryPage(authenticatedPage);

  await inventory.addToCartByName('Sauce Labs Backpack');

  expect(await inventory.getCartBadgeCount()).toBe('1');
});

test('multiple products appear in cart', async ({ authenticatedPage }) => {
  const inventory = new InventoryPage(authenticatedPage);
  const cart = new CartPage(authenticatedPage);

  await inventory.addToCartByName('Sauce Labs Backpack');
  await inventory.addToCartByName('Sauce Labs Bike Light');
  await inventory.goToCart();

  const items = await cart.getItemNames();
  expect(items).toContain('Sauce Labs Backpack');
  expect(items).toContain('Sauce Labs Bike Light');
});

test('removing item updates cart', async ({ authenticatedPage }) => {
  const inventory = new InventoryPage(authenticatedPage);
  const cart = new CartPage(authenticatedPage);

  await inventory.addToCartByName('Sauce Labs Backpack');
  await inventory.addToCartByName('Sauce Labs Bike Light');
  await inventory.goToCart();

  await cart.removeItemByName('Sauce Labs Backpack');

  const items = await cart.getItemNames();
  expect(items).not.toContain('Sauce Labs Backpack');
  expect(items).toContain('Sauce Labs Bike Light');
});

test('complete checkout happy path', async ({ authenticatedPage }) => {
  const inventory = new InventoryPage(authenticatedPage);
  const cart = new CartPage(authenticatedPage);
  const checkout = new CheckoutPage(authenticatedPage);

  await inventory.addToCartByName('Sauce Labs Backpack');
  await inventory.goToCart();
  await cart.proceedToCheckout();
  await checkout.fillInformation('Bogdan', 'Carcadea', '12345');
  await checkout.finish();

  await expect(authenticatedPage.getByText('Thank you for your order')).toBeVisible();
});

test('checkout with empty fields shows error', async ({ authenticatedPage }) => {
  const inventory = new InventoryPage(authenticatedPage);
  const cart = new CartPage(authenticatedPage);
  const checkout = new CheckoutPage(authenticatedPage);

  await inventory.addToCartByName('Sauce Labs Backpack');
  await inventory.goToCart();
  await cart.proceedToCheckout();
  await checkout.fillInformation('', '', '');

  const error = await checkout.getErrorMessage();
  expect(error).toContain('First Name is required');
});