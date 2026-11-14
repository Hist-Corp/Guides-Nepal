/**
 * Guides Nepal — QA E2E: Search & Discovery Tests
 *
 * Tests search functionality, filtering, sorting, and city/experience pages.
 */

import { test, expect } from '@playwright/test';

test.describe('Public — Search & Discovery', () => {
  test('search page loads with search input', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/search');
    // Search input should be present
    await expect(page.locator('input[type="search"], input[placeholder*="search" i], input[name="q"]')).toBeVisible();
  });

  test('city page loads for Kathmandu', async ({ page }) => {
    await page.goto('/city/kathmandu');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/city/kathmandu');
  });

  test('city experiences page loads', async ({ page }) => {
    await page.goto('/city/kathmandu/experiences');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/city/kathmandu/experiences');
  });

  test('city experiences for Pokhara loads', async ({ page }) => {
    await page.goto('/city/pokhara/experiences');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/city/pokhara/experiences');
  });

  test('city experiences for Lalitpur loads', async ({ page }) => {
    await page.goto('/city/lalitpur/experiences');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/city/lalitpur/experiences');
  });

  test('city experiences for Bhaktapur loads', async ({ page }) => {
    await page.goto('/city/bhaktapur/experiences');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/city/bhaktapur/experiences');
  });

  test('city experiences for Bharatpur loads', async ({ page }) => {
    await page.goto('/city/bharatpur/experiences');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/city/bharatpur/experiences');
  });
});