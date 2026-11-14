import { test, expect } from '@playwright/test';

test.describe('Regional Head Dashboard — Authentication', () => {
  test('regional head can access dashboard', async ({ page }) => {
    await page.goto('http://localhost:5176/regional-head/login');
    await page.locator('input[type="email"]').fill('regional-head@guides-nepal.com');
    await page.locator('input[type="password"]').fill('Regional@12345');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*\/regional-head\/dashboard/);
    await expect(page.locator('h1')).toBeVisible();
  });
});