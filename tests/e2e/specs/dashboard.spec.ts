import { test, expect } from '@playwright/test';

test.describe('Dashboard — Auth + Nav buttons', () => {
  const adminUser = { email: 'admin@guides-nepal.com', password: 'Admin@12345' };

  test('login page has all expected buttons', async ({ page }) => {
    await page.goto('/dashboard/login');

    // Role selector dropdown
    await expect(page.locator('select')).toBeVisible();

    // Email field
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Password field with show/hide toggle
    await expect(page.locator('input[type="password"]')).toBeVisible();
    const pwToggle = page.getByRole('button', { name: /show password/i });
    await expect(pwToggle).toBeVisible();
    await pwToggle.click();
    await expect(page.getByRole('button', { name: /Hide password/i })).toBeVisible();

    // Remember me checkbox
    await expect(page.getByLabel(/remember me/i)).toBeVisible();

    // Forgot password link
    await expect(page.getByRole('button', { name: /Forgot your password/i })).toBeVisible();

    // Login button
    await expect(page.getByRole('button', { name: /^Login$/i })).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/dashboard/login');
    await page.selectOption('select', 'admin');
    await page.fill('input[type="email"]', 'nonexistent@test.com');
    await page.fill('input[type="password"]', 'WrongPass123!');
    await page.getByRole('button', { name: /^Login$/i }).click();
    // Should show error message (from API or generic)
    await expect(page.locator('text=/failed|invalid|error|incorrect|credentials|must|exist/i')).toBeVisible({ timeout: 10000 });
  });

  test('login with valid admin credentials logs in and navigates', async ({ page }) => {
    await page.goto('/dashboard/login');
    await page.selectOption('select', 'admin');
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.password);
    await page.getByRole('button', { name: /^Login$/i }).click();
    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 15000 });
  });

  test('logged-in admin sees topbar with logout button', async ({ page }) => {
    await page.goto('/dashboard/login');
    await page.selectOption('select', 'admin');
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.password);
    await page.getByRole('button', { name: /^Login$/i }).click();
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 15000 });

    // Topbar elements
    await expect(page.locator('text=Dashboard Login')).not.toBeVisible();
    const logoutBtn = page.getByRole('button', { name: /Logout/i });
    await expect(logoutBtn).toBeVisible();
    // The topbar shows the logged-in user name + role
    await expect(page.getByText('Admin User')).toBeVisible();
  });

  test('admin nav sidebar has all expected links', async ({ page }) => {
    await page.goto('/dashboard/login');
    await page.selectOption('select', 'admin');
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.password);
    await page.getByRole('button', { name: /^Login$/i }).click();
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 15000 });

    const sidebarLinks = ['Overview', 'Hosts', 'Guides'];
    for (const label of sidebarLinks) {
      await expect(page.getByRole('link', { name: label })).toBeVisible();
    }
  });

  test('admin sidebar navigation works', async ({ page }) => {
    await page.goto('/dashboard/login');
    await page.selectOption('select', 'admin');
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.password);
    await page.getByRole('button', { name: /^Login$/i }).click();
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 15000 });

    // Navigate to Guides
    await page.getByRole('link', { name: 'Guides' }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin\/guides/);

    // Navigate back to Overview
    await page.getByRole('link', { name: 'Overview' }).click();
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 5000 });
  });

  test('logout button clears session and redirects to login', async ({ page }) => {
    await page.goto('/dashboard/login');
    await page.selectOption('select', 'admin');
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.password);
    await page.getByRole('button', { name: /^Login$/i }).click();
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 15000 });

    await page.getByRole('button', { name: /Logout/i }).click();
    await expect(page).toHaveURL('/dashboard/login');
  });

  test('protected routes redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL('/dashboard/login');
  });

  test('forgot password button opens modal', async ({ page }) => {
    await page.goto('/dashboard/login');
    await page.getByRole('button', { name: /Forgot your password/i }).click();
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible({ timeout: 8000 });
  });
});
