import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'small-mobile', width: 320, height: 568, label: 'Small mobile' },
  { name: 'standard-mobile', width: 375, height: 812, label: 'Standard mobile' },
  { name: 'tablet', width: 768, height: 1024, label: 'Tablet' },
  { name: 'laptop', width: 1366, height: 768, label: 'Laptop' },
  { name: 'desktop', width: 1440, height: 900, label: 'Desktop' },
  { name: 'large-desktop', width: 1920, height: 1080, label: 'Large desktop' },
];

for (const vp of VIEWPORTS) {
  test.describe(`${vp.label} (${vp.width}x${vp.height})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
    });

    test('no horizontal scroll', async ({ page }) => {
      const body = page.locator('body');
      const scrollWidth = await body.evaluate((el) => el.scrollWidth);
      const clientWidth = await body.evaluate((el) => el.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test('main content visible', async ({ page }) => {
      await expect(page.locator('main')).toBeVisible();
    });

    test('header visible', async ({ page }) => {
      await expect(page.locator('header')).toBeVisible();
    });

    test('footer visible', async ({ page }) => {
      await expect(page.locator('footer')).toBeVisible();
    });

    test('header CTAs clickable', async ({ page }) => {
      const ctaCount = await page.locator('a.btn, button.btn').count();
      if (ctaCount > 0) {
        for (let i = 0; i < Math.min(ctaCount, 3); i++) {
          const btn = page.locator('a.btn, button.btn').nth(i);
          await expect(btn).toBeVisible();
          await expect(btn).toBeEnabled();
        }
      }
    });
  });
}

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('hamburger opens on mobile', async ({ page }) => {
    const menuBtn = page.locator('button[data-testid="mobile-menu"]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await expect(page.locator('nav.mobile-menu')).toBeVisible();
    }
  });
});
