import { test, expect } from '@playwright/test';

test.describe('Edge Cases — Authentication', () => {
  test('wrong password rejected', async ({ page }) => {
    await page.goto('http://localhost:5175/login');
    await page.locator('header').getByRole('button', { name: /^Log in$/i }).first().click();
    await page.locator('form input[type="email"]').fill('traveler@guides-nepal.com');
    await page.locator('form input[type="password"]').fill('WrongPassword123!');
    await page.getByRole('button', { name: /^Log in$/i }).click();
    await expect(page.locator('text=/invalid|incorrect|error/i')).toBeVisible({ timeout: 5000 });
  });

  test('empty credentials rejected', async ({ page }) => {
    await page.goto('http://localhost:5175/login');
    await page.locator('header').getByRole('button', { name: /^Log in$/i }).first().click();
    await page.getByRole('button', { name: /^Log in$/i }).click();
    await expect(page.locator('text=/required|empty|fill/i')).toBeVisible({ timeout: 5000 });
  });

  test('invalid email rejected', async ({ page }) => {
    await page.goto('http://localhost:5175/signup');
    await page.locator('form input[type="email"]').fill('not-an-email');
    await page.locator('form input[type="email"]').blur();
    await expect(page.locator('text=/invalid|valid email/i')).toBeVisible({ timeout: 5000 });
  });

  test('duplicate email rejected', async ({ page }) => {
    await page.goto('http://localhost:5175/signup');
    await page.locator('form input[type="email"]').fill('admin@guides-nepal.com');
    await page.locator('form input[type="password"]').fill('Traveler@2024');
    await page.getByRole('button', { name: /^Sign up$/i }).click();
    await expect(page.locator('text=/already|exists|duplicate/i')).toBeVisible({ timeout: 5000 });
  });

  test('password mismatch rejected', async ({ page }) => {
    await page.goto('http://localhost:5175/signup');
    await page.locator('form input[type="email"]').fill('qa.newuser@example.com');
    await page.locator('form input[type="password"]').fill('Traveler@2024');
    await page.locator('form input[type="password"]').last().fill('DifferentPassword@2024');
    await page.getByRole('button', { name: /^Sign up$/i }).click();
    await expect(page.locator('text=/match|same|identical/i')).toBeVisible({ timeout: 5000 });
  });
});