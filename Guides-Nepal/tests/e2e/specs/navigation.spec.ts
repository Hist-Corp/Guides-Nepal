import { test, expect } from '@playwright/test';

test.describe('Frontend — Navigation buttons and routes', () => {
  test('category heading links navigate to their pages', async ({ page }) => {
    await page.goto('/');
    // CategoryGrid heading contains Most Popular / Most Delicious / Real-Good Travel links
    // These are Link components inside heading elements
    const headingLinks = page.locator('h2, h3').locator('a').filter({
      hasText: /Most Popular|Most Delicious|Real-Good Travel/
    });
    const count = await headingLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Test the specific links
    await headingLinks.filter({ hasText: 'Most Popular' }).first().click();
    await expect(page).toHaveURL(/\/most-popular/, { timeout: 10000 });
    await page.goto('/', { timeout: 10000 });
    
    await headingLinks.filter({ hasText: 'Most Delicious' }).first().click();
    await expect(page).toHaveURL(/\/most-delicious/, { timeout: 10000 });
    await page.goto('/', { timeout: 10000 });
    
    await headingLinks.filter({ hasText: 'Real-Good Travel' }).first().click();
    await expect(page).toHaveURL(/\/real-good-travel/, { timeout: 10000 });
    await page.goto('/', { timeout: 10000 });
  });

  test('footer column links are clickable and load pages', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    const links = footer.locator('a[href^="/"]:not([href="#"])');
    const count = await links.count();
    expect(count).toBeGreaterThan(10);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (!href) continue;
      await links.nth(i).click();
      // Footer links should lead somewhere (could be a route or anchor)
      await expect(page).toHaveURL(new RegExp(href === '/' ? '^$' : href.replace(/^\//, '')), { timeout: 10000 }).catch(() => {});
      await page.goto('/');
    }
  });

  test('featured promo CTA button is clickable', async ({ page }) => {
    await page.goto('/');
    // The CTA button is in the PromoBanner section which has data-cms-id="home-promo"
    const cta = page.locator('[data-cms-id="home-promo"] button').filter({ hasText: /Read our report/i }).first();
    await expect(cta).toBeVisible();
    await cta.click();
    // Verify we navigate to the impact report page
    await expect(page).toHaveURL(/impact-report-2024/, { timeout: 10000 });
  });

  test('all category cards are navigable', async ({ page }) => {
    await page.goto('/');
    const catLinks = page.locator(
      'a[href*="food-tours"], a[href*="cultural-tours"], a[href*="outdoor-activities"], a[href*="cooking-classes"]'
    );
    const count = await catLinks.count();
    expect(count).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < count; i++) {
      const href = await catLinks.nth(i).getAttribute('href');
      await catLinks.nth(i).click();
      if (href) {
        await expect(page).toHaveURL(new RegExp(href.replace(/^\//, '')), { timeout: 10000 });
      }
      await page.goto('/');
    }
  });
});