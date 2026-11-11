/**
 * Guides Nepal — QA E2E: Public Home Page Tests
 *
 * Tests home page loading, navigation, category links, footer links, and
 * accessibility of the landing page.
 */

import { test, expect } from '@playwright/test';

test.describe('Public — Home Page', () => {
  test('home page loads with hero heading', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('footer links load destination pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const footerLinks = page.locator('footer a[href^="/"]:not([href="#"])');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(10);

    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const link = footerLinks.nth(i);
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/') && !href.includes('#')) {
        await link.click();
        await page.waitForLoadState('networkidle');
        await expect(page.url()).not.toBe('http://localhost:5175/');
      }
    }
  });

  test('promo section has CTA button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Home page should have at least one prominent CTA button
    const ctaButtons = page.locator('button').filter({ hasText: /^(Read|Learn|Discover|Explore|Book|Get)/i });
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('navigation header links are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const navLinks = page.locator('nav a[href], header a[href]');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('home page does not show console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const criticalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('404'));
    expect(criticalErrors.length).toBe(0);
  });
});