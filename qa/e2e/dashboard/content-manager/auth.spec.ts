import { test, expect } from '@playwright/test';

test.describe('Content Manager Dashboard — Authentication', () => {
  test('content manager can access dashboard', async ({ page }) => {
    await page.goto('http://localhost:5176/content-manager/login');
    await page.locator('input[type="email"]').fill('content-manager@guides-nepal.com');
    await page.locator('input[type="password"]').fill('Content@12345');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*\/content-manager\/dashboard/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('content manager cannot access admin routes', async ({ page }) => {
    await page.goto('http://localhost:5176/content-manager/login');
    await page.locator('input[type="email"]').fill('content-manager@guides-nepal.com');
    await page.locator('input[type="password"]').fill('Content@12345');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/.*\/content-manager\/dashboard/);

    await page.goto('http://localhost:5176/admin/dashboard');
    await expect(page).not.toHaveURL(/.*\/admin\/dashboard/);
  });
});