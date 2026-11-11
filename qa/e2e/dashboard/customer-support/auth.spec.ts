import { test, expect } from '@playwright/test';

test.describe('Customer Support Dashboard — Authentication', () => {
  test('customer support can access dashboard', async ({ page }) => {
    await page.goto('http://localhost:5176/customer-support/login');
    await page.locator('input[type="email"]').fill('support@guides-nepal.com');
    await page.locator('input[type="password"]').fill('Support@12345');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*\/customer-support\/dashboard/);
    await expect(page.locator('h1')).toBeVisible();
  });
});