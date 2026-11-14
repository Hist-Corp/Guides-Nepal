import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard — Authentication', () => {
  test('admin can access dashboard', async ({ page }) => {
    await page.goto('http://localhost:5176/admin/login');
    await page.locator('input[type="email"]').fill('admin@guides-nepal.com');
    await page.locator('input[type="password"]').fill('Admin@12345');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*\/admin\/dashboard/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('admin cannot access without login', async ({ page }) => {
    await page.goto('http://localhost:5176/admin/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});

test.describe('Admin Dashboard — Navigation', () => {
  test('admin can navigate to all sections', async ({ page }) => {
    await page.goto('http://localhost:5176/admin/login');
    await page.locator('input[type="email"]').fill('admin@guides-nepal.com');
    await page.locator('input[type="password"]').fill('Admin@12345');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/.*\/admin\/dashboard/);

    await page.click('text=Hosts');
    await expect(page).toHaveURL(/.*\/admin\/hosts/);

    await page.click('text=Guides');
    await expect(page).toHaveURL(/.*\/admin\/guides/);

    await page.click('text=Support Tickets');
    await expect(page).toHaveURL(/.*\/admin\/support/);
  });
});