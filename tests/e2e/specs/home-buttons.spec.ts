import { test, expect } from '@playwright/test';

test.describe('Frontend — Home page buttons and links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero search button opens the search overlay', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Where are you going?"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Kathmandu');
    const searchBtn = page.getByRole('button', { name: /^Search$/i }).first();
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();
    // Opening search renders the header search modal, increasing total inputs to 2
    await expect(page.locator('input')).toHaveCount(2, { timeout: 8000 });
  });

  test('category Explore buttons navigate to category pages', async ({ page }) => {
    const catLink = page
      .locator('a[href*="food-tours"], a[href*="cultural-tours"], a[href*="outdoor-activities"], a[href*="cooking-classes"]')
      .first();
    await catLink.click();
    await expect(page).toHaveURL(/\/food-tours|\/cultural-tours|\/outdoor-activities|\/cooking-classes/);
  });

  test('featured experience cards link to city pages', async ({ page }) => {
    const featured = page.locator('a[href^="/city/"]').first();
    await featured.click();
    await expect(page.url()).toMatch(/\/city\//);
  });

  test('footer links navigate to their routes', async ({ page }) => {
    await page.getByRole('link', { name: /^About Us$/i }).first().click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('social media links are present and clickable', async ({ page }) => {
    const socialLinks = page.locator('footer a[href="#"]');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await socialLinks.nth(i).click({ warnIfNoScrolling: true });
    }
  });

  test('header logo navigates to home', async ({ page }) => {
    await page.goto('/about');
    await page.locator('header').getByRole('link', { name: /guides-nepal/i }).first().click();
    await expect(page.url()).toMatch(/\/$/);
  });

  test('header Login button opens login modal', async ({ page }) => {
    await page.locator('header').getByRole('button', { name: /^Log in$/i }).first().click();
    await expect(page.locator('form input[type="email"]')).toBeVisible();
    await expect(page.locator('button', { name: /^Log in$/i }).last()).toBeVisible();
  });

  test('header Sign Up button opens signup modal', async ({ page }) => {
    await page.locator('header').getByRole('button', { name: /^Sign up$/i }).first().click();
    // SignupModal opens at the role-selection step
    await expect(page.locator('text=Join Guides-Nepal')).toBeVisible();
  });

  test('header cart button is present and enabled', async ({ page }) => {
    // The cart button is an icon-only button containing an svg in the header
    const cartBtn = page.locator('header').locator('button').filter({ has: page.locator('svg') }).nth(0);
    await expect(cartBtn).toBeEnabled();
  });

  test('header shows functional auth buttons', async ({ page }) => {
    const headerButtons = page.locator('header').getByRole('button', { name: /Log in|Sign up/i });
    const count = await headerButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < count; i++) {
      expect(await headerButtons.nth(i).isEnabled()).toBe(true);
    }
  });
});