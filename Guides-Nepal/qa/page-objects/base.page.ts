/**
 * Base Page Object — common utilities for all page objects.
 */

import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to a path relative to baseURL. */
  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  /** Wait for the page to navigate and return the new URL. */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
    return this.page.url();
  }

  /** Click an element and wait for navigation. */
  async clickAndWait(locator: string | Locator, options?: { url?: string }) {
    const loc = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await loc.click();
    await this.page.waitForLoadState('networkidle');
    if (options?.url) {
      await expect(this.page).toHaveURL(options.url);
    }
  }

  /** Fill an input field. */
  async fill(selector: string, value: string) {
    await this.page.locator(selector).fill(value);
  }

  /** Check that an element is visible. */
  async expectVisible(selector: string | Locator) {
    const loc = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(loc).toBeVisible();
  }

  /** Check that an element is hidden. */
  async expectHidden(selector: string | Locator) {
    const loc = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(loc).toBeHidden();
  }

  /** Get the current page URL. */
  async getUrl(): Promise<string> {
    return this.page.url();
  }

  /** Take a screenshot with a custom name. */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `qa/screenshots/${name}.png`, fullPage: true });
  }

  /** Check for console errors. */
  async collectConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }
}