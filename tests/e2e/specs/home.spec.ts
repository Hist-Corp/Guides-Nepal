import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/Guides Nepal/);
  });

  test('should navigate to Kathmandu page', async ({ page }) => {
    await page.goto('/');
    
    // Click on Kathmandu link (adjust selector as needed)
    await page.click('text=Kathmandu');
    
    // Verify navigation
    await expect(page).toHaveURL(/.*kathmandu/);
  });

  test('should display featured experiences', async ({ page }) => {
    await page.goto('/');
    
    // Check for featured experiences section
    const featuredSection = page.locator('text=Featured Experiences');
    await expect(featuredSection).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to all city pages', async ({ page }) => {
    const cities = ['Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Bharatpur'];
    
    for (const city of cities) {
      await page.goto('/');
      await page.click(`text=${city}`);
      await expect(page).toHaveURL(new RegExp(`.*${city.toLowerCase()}`));
    }
  });
});

test.describe('Search', () => {
  test('should open search page', async ({ page }) => {
    await page.goto('/');
    
    // Click on search (adjust selector as needed)
    await page.click('text=Search');
    
    // Verify search page loads
    await expect(page).toHaveURL(/.*search/);
  });
});

test.describe('User Authentication', () => {
  test('should open login modal', async ({ page }) => {
    await page.goto('/');
    
    // Click on login button (adjust selector as needed)
    await page.click('text=Login');
    
    // Verify login modal appears
    const loginModal = page.locator('text=Login to your account');
    await expect(loginModal).toBeVisible();
  });
});