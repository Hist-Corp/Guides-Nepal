import { test, expect } from '@playwright/test';

test.describe('Frontend — Auth flow buttons', () => {
  test('login modal password toggle changes input type', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('button', { name: /^Log in$/i }).first().click();
    const pwInput = page.locator('form input[type="password"]');
    await expect(pwInput).toBeVisible();
    // Toggle is the sibling button after the password input
    const toggle = page.locator('form input[type="password"] ~ button').first();
    await expect(toggle).toBeVisible();
    await toggle.click();
    // After toggling, the password field is no longer type="password"
    await expect(page.locator('form input[type="password"]')).toHaveCount(0);
  });

  test('login modal forgot-password button opens forgot flow', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('button', { name: /^Log in$/i }).first().click();
    await page.getByRole('button', { name: /Forgot your password/i }).first().click();
    // ForgotPasswordModal copy
    await expect(page.locator('text=Enter your account email')).toBeVisible();
  });

  test('login modal "Sign up" button switches to signup', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('button', { name: /^Log in$/i }).first().click();
    // The switch-to-signup button inside the login modal (last "Sign up" after opening login)
    await page.getByRole('button', { name: /^Sign up$/i }).last().click();
    // SignupModal opens at role-selection step
    await expect(page.locator('text=Join Guides-Nepal')).toBeVisible();
  });

  test('forgot password modal submits email and shows success', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('button', { name: /^Log in$/i }).first().click();
    await page.getByRole('button', { name: /Forgot your password/i }).first().click();
    await page.locator('form input[type="email"]').fill('test@example.com');
    await page.getByRole('button', { name: /Send reset link/i }).click();
    // Always shows generic success for security
    await expect(page.locator('text=/password reset link/i')).toBeVisible({ timeout: 10000 });
  });

  test('signup modal social login buttons are present', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('button', { name: /^Sign up$/i }).first().click();
    // The social buttons are icon-only svg buttons (Apple, Facebook, Google)
    const socialBtns = page.locator('button').filter({ has: page.locator('svg') });
    const count = await socialBtns.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('signup modal shows email form after selecting traveler', async ({ page }) => {
    await page.goto('/');
    await page.locator('header').getByRole('button', { name: /^Sign up$/i }).first().click();
    // Choose "I'm a Traveler" to reach the email form step
    await page.getByRole('button', { name: /I.m a Traveler/i }).click();
    await expect(page.locator('text=Sign up with your email address')).toBeVisible();
    await expect(page.locator('form input[type="email"]')).toBeVisible();
    await expect(page.locator('form input[type="password"]')).toBeVisible();
  });

  test('currency converter modal opens and converts', async ({ page }) => {
    await page.goto('/');
    const ccBtn = page.locator('button[aria-label="Currency converter"], button[title*="Currency"], button[title*="currency"]');
    if (!(await ccBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      test.skip();
      return;
    }
    await ccBtn.click();
    const amount = page.locator('input[type="number"]').last();
    await amount.fill('100');
    await page.getByRole('button', { name: /^Convert$/i }).click();
    await expect(page.locator('text=/equals/i')).toBeVisible({ timeout: 5000 });
  });
});