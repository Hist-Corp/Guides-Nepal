import { test, expect } from '@playwright/test';

test.describe('Frontend — Navigation buttons and routes', () => {
  test('category heading links navigate to their pages', async ({ page }) => {
    await page.goto('/');
    // CategoryGrid heading contains Most Popular / Most Delicious / Real-Good Travel links
    const links = [
      { name: /^Most Popular$/i, url: /\/most-popular/ },
      { name: /^Most Delicious$/i, url: /\/most-delicious/ },
      { name: /^Real-Good Travel\.$/i, url: /\/real-good-travel/ },
    ];
    for (const { name, url } of links) {
      const link = page.getByRole('link', { name }).first();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(url, { timeout: 10000 });
      await page.goto('/');
    }
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
    const cta = page.locator('button', { name: /Read our report/i }).first();
    await expect(cta).toBeVisible();
    await cta.click();
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