/**
 * Guides Nepal — QA E2E: Authentication Tests
 *
 * Tests login modal, signup modal, password toggle, forgot password,
 * role selection, and terms acceptance.
 */

import { test, expect } from '@playwright/test';
import { AuthPage } from '../../page-objects/auth.page';
import { HomePage } from '../../page-objects/home.page';

test.describe('Authentication — Login/Signup Modals', () => {
  let authPage: AuthPage;
  let homePage: HomePage;

  test.beforeEach(({ page }) => {
    authPage = new AuthPage(page);
    homePage = new HomePage(page);
  });

  test('login modal opens and password toggle works', async ({ page }) => {
    await homePage.goto();
    await homePage.verifyPageLoaded();

    await authPage.openLoginModal();
    const pwInput = page.locator('input[type="password"]');
    await expect(pwInput).toBeVisible();

    await authPage.togglePasswordVisibility();
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
  });

  test('login modal forgot-password opens reset flow', async ({ page }) => {
    await homePage.goto();
    await authPage.openLoginModal();
    await page.getByRole('button', { name: /Forgot your password/i }).first().click();
    await expect(page.locator('text=Enter your account email')).toBeVisible();
  });

  test('signup modal switches from login', async ({ page }) => {
    await homePage.goto();
    await authPage.openLoginModal();
    await page.getByRole('button', { name: /^Sign up$/i }).last().click();
    await expect(page.locator('text=Join Guides-Nepal')).toBeVisible();
  });

  test('forgot password submits email and shows generic success', async ({ page }) => {
    await homePage.goto();
    await authPage.openLoginModal();
    await page.getByRole('button', { name: /Forgot your password/i }).first().click();
    await page.locator('input[type="email"]').fill('qa-test@example.com');
    await page.getByRole('button', { name: /Send reset link/i }).click();
    await expect(page.locator('text=/password reset link/i')).toBeVisible({ timeout: 10000 });
  });

  test('signup modal social login buttons present', async ({ page }) => {
    await homePage.goto();
    await authPage.openSignupModal();
    const socialBtns = page.locator('button').filter({ has: page.locator('svg') });
    const count = await socialBtns.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('signup shows email form after selecting traveler', async ({ page }) => {
    await homePage.goto();
    await authPage.openSignupModal();
    await page.getByRole('button', { name: /I.m a Traveler/i }).click();
    await expect(page.locator('text=Sign up with your email address')).toBeVisible();
    // The signup form is the last form in the modal
    const signupForm = page.locator('form').last();
    await expect(signupForm.locator('input[type="email"]')).toBeVisible();
    await expect(signupForm.locator('input[type="password"]').first()).toBeVisible();
  });

  test('signup modal does not offer Host self-registration', async ({ page }) => {
    await homePage.goto();
    await authPage.openSignupModal();
    await expect(page.locator('text=Join Guides-Nepal')).toBeVisible();
    await expect(page.getByRole('button', { name: /I.m a Host/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /I.m a Traveler/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /I.m a Local Guide/i })).toBeVisible();
  });

  test('traveler signup requires Terms & Privacy acceptance', async ({ page }) => {
    await homePage.goto();
    await authPage.openSignupModal();
    await page.getByRole('button', { name: /I.m a Traveler/i }).click();
    const form = page.locator('form').last();
    const termsBox = form.locator('input[type="checkbox"]');
    await expect(termsBox).toBeVisible();
    await expect(form.getByRole('button', { name: /^Sign up$/i })).toBeDisabled();
    await termsBox.check();
    await expect(form.getByRole('button', { name: /^Sign up$/i })).toBeEnabled();
  });
});