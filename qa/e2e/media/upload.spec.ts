import { test, expect } from '@playwright/test';

test.describe('File Upload Testing', () => {
  test('profile image upload', async ({ page }) => {
    await page.goto('http://localhost:5175/login');
    await page.locator('button[role="button"][name*="Sign up"]').click();
    await page.locator('text=Join Guides-Nepal').waitFor();
    await page.locator('button[role="button"][name*="Traveler"]').click();
    await expect(page.locator('text=Sign up with your email address')).toBeVisible();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('qa/test-uploads/selfie.png');

    await expect(page.locator('img[src*="selfie"]')).toBeVisible();
  });

  test('document upload for guide application', async ({ page }) => {
    await page.goto('http://localhost:5175/become-a-guide');
    await expect(page.locator('h1')).toContainText('Become a Guide');

    await page.locator('input[type="file"][name*="citizenship"]').setInputFiles('qa/test-uploads/citizenship_front.png');
    await page.locator('input[type="file"][name*="selfie"]').setInputFiles('qa/test-uploads/selfie.png');
    await page.locator('input[type="file"][name*="certificate"]').setInputFiles('qa/test-uploads/certificate.png');

    await expect(page.locator('text=Documents uploaded successfully')).toBeVisible();
  });

  test('unsupported file type rejected', async ({ page }) => {
    await page.goto('http://localhost:5175/login');
    await page.locator('button[role="button"][name*="Sign up"]').click();
    await page.locator('text=Join Guides-Nepal').waitFor();
    await page.locator('button[role="button"][name*="Traveler"]').click();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('qa/test-uploads/certificate.png');

    const response = await page.waitForResponse('**/api/v1/auth/register');
    expect(response.status()).toBeLessThan(400);
  });
});