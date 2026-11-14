/**
 * Home Page Object — homepage interactions.
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly heroHeading = 'h1';
  readonly categoryLinks = 'a[href*="food-tours"], a[href*="cultural-tours"], a[href*="outdoor-activities"], a[href*="cooking-classes"]';
  readonly promoCTA = 'button:has-text(/Read our report/i)';
  readonly footerLinks = 'footer a[href^="/"]:not([href="#"])';
  readonly navLinks = 'nav a[href]';
  readonly searchButton = 'button:has-text(/search/i), [aria-label="search"]';

  async verifyPageLoaded() {
    await expect(this.page.locator(this.heroHeading)).toBeVisible();
  }

  async clickCategoryLink(index: number = 0) {
    const links = this.page.locator(this.categoryLinks);
    await expect(links).toHaveCount(greaterThanOrEqual(1));
    await links.nth(index).click();
  }

  async clickFooterLink(index: number) {
    const links = this.page.locator(this.footerLinks);
    await links.nth(index).click();
  }

  async countFooterLinks(): Promise<number> {
    return this.page.locator(this.footerLinks).count();
  }

  async clickPromoCTA() {
    await this.page.locator(this.promoCTA).first().click();
  }
}

function greaterThanOrEqual(n: number) {
  return { min: n };
}