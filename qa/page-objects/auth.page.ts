/**
 * Auth Page Object — login and signup modal interactions.
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AuthPage extends BasePage {
  // Selectors
  readonly loginButton = 'header button:has-text("Log in")';
  readonly signupButton = 'header button:has-text("Sign up")';
  readonly loginModal = '[role="dialog"]';
  readonly signupModal = '[role="dialog"]';
  readonly emailInput = 'input[type="email"]';
  readonly passwordInput = 'input[type="password"]';
  readonly confirmPasswordInput = 'input[type="password"]:nth-of-type(2)';
  readonly passwordToggle = 'input[type="password"] ~ button';
  readonly termsCheckbox = 'input[type="checkbox"]';
  readonly submitButton = 'button:has-text("Sign up"), button:has-text("Log in")';
  readonly forgotPasswordButton = 'button:has-text(/Forgot your password/i)';
  readonly resetSuccessText = 'text=/password reset link/i';
  readonly travelerRoleButton = 'button:has-text(/I.m a Traveler/i)';
  readonly guideRoleButton = 'button:has-text(/I.m a Local Guide/i)';
  readonly joinHeading = 'text=Join Guides-Nepal';
  readonly emailFormHeading = 'text=Sign up with your email address';

  async openLoginModal() {
    const btn = this.page.locator(this.loginButton).first();
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(this.page.locator(this.loginModal)).toBeVisible();
  }

  async openSignupModal() {
    const btn = this.page.locator(this.signupButton).first();
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(this.page.locator(this.signupModal)).toBeVisible();
  }

  async fillLogin(email: string, password: string) {
    await this.page.locator(this.emailInput).first().fill(email);
    await this.page.locator(this.passwordInput).first().fill(password);
  }

  async fillSignup(
    email: string,
    password: string,
    confirmPassword?: string,
    acceptTerms = true
  ) {
    await this.page.locator(this.emailInput).last().fill(email);
    await this.page.locator(this.passwordInput).last().fill(password);
    if (confirmPassword) {
      await this.page.locator(this.confirmPasswordInput).fill(confirmPassword);
    }
    if (acceptTerms) {
      const checkbox = this.page.locator(this.termsCheckbox).last();
      if ((await checkbox.count()) > 0) {
        await checkbox.check();
      }
    }
  }

  async togglePasswordVisibility() {
    await this.page.locator(this.passwordToggle).first().click();
  }

  async selectTravelerRole() {
    await this.page.locator(this.travelerRoleButton).click();
    await expect(this.page.locator(this.emailFormHeading)).toBeVisible();
  }

  async submitLogin() {
    await this.page.locator('button:has-text("Log in")').last().click();
  }

  async submitSignup() {
    await this.page.locator('button:has-text("Sign up")').last().click();
  }

  async expectLoginError() {
    await expect(this.page.locator('text=/invalid|error|incorrect/i')).toBeVisible();
  }

  async expectSignupSuccess() {
    await expect(this.page.locator('text=/welcome|success|account created/i')).toBeVisible();
  }
}