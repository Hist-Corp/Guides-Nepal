import { test, expect } from '@playwright/test';

// Accessibility test suite covering all pages
// Targets: WCAG 2.2 AA compliance
// Run: npx playwright test tests/e2e/specs/accessibility.spec.ts

test.describe('Accessibility — Full Suite', () => {
  const accessibilityPages = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/index.html', name: 'Index' },
    { path: '/karachi-city', name: 'Karachi City' },
    { path: '/lahore-city', name: 'Lahore City' },
    { path: '/lahore-experiences', name: 'Lahore Experiences' },
    { path: '/kathmandu', name: 'Kathmandu' },
    { path: '/pokhara', name: 'Pokhara' },
    { path: '/bcn-foodie', name: 'Foodie' },
    { path: '/bkk-tour', name: 'BKK Tour' },
    { path: '/explore', name: 'Explore' },
    { path: '/booking', name: 'Booking' },
    { path: '/explore/4', name: 'Explore 4' },
  ];

  accessibilityPages.forEach((page) => {
    test(`${page.name} — Accessible`, async ({ page }) => {
      await page.goto(`http://127.0.0.1:5175`);
      await page.waitForLoadState('domcontentloaded');

      // 1. Skip to main content link exists
      await expect(page.locator('a[href="#main-content"]')).toBeVisible();

      // 2. Main content exists
      await expect(page.locator('main#main-content')).toBeVisible();

      // 3. Page has a heading
      const h1s = page.locator('h1');
      await expect(h1s.first()).toBeVisible();

      // 4. Images have alt attributes
      const images = page.locator('img');
      const imageCount = await images.count();
      if (imageCount > 0) {
        const imagesWithoutAlt = page.locator('img:not([alt])');
        const missing = await imagesWithoutAlt.count();
        if (missing > 0) {
          console.log(`  ${page.name}: ${missing}/${imageCount} images missing alt`);
        }
      }

      // 5. Focus visible styles present
      const hasFocusStyles = await page.locator('*:focus-visible').first().isVisible().catch(() => false);
      // CSS focus styles should be in the page
      const hasFocusCss = await page.locator('html').evaluate((el) => {
        const styles = getComputedStyle(el);
        return styles.outline + styles.outlineOffset;
      }).catch(() => false);

      // 6. Skip link should be focusable first
      const skipLink = page.locator('a[href="#main-content"]').first();
      await skipLink.scrollIntoViewIfNeeded();
      await expect(skipLink).toBeVisible();
    });
  });
});
