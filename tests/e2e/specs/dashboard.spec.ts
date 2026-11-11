import { test, expect } from '@playwright/test';

test.describe('Dashboard — Auth + Nav buttons', () => {
  const adminUser = { email: 'admin@guides-nepal.com', password: process.env.DASHBOARD_ADMIN_PASSWORD || 'Admin@12345' };

  test('login page has all expected buttons', async ({ page }) => {
    await page.goto('/dashboard/login');

    // Role selector dropdown (custom button-based dropdown)
    await expect(page.locator('button').filter({ hasText: /Admin/i })).toBeVisible();

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

    // Forgot password link (it's a button with text, not role)
    await expect(page.locator('button').filter({ hasText: /Forgot password\?/i }).first()).toBeVisible();

    // Login button
    await expect(page.getByRole('button', { name: /^Sign in$/i })).toBeVisible();
  });

  async function loginAsAdmin(page: any) {
    // Open role dropdown
    const roleDropdown = page.locator('button').filter({ hasText: /Admin/i }).first();
    await roleDropdown.click();
    
    // Select admin from dropdown (the dropdown list contains buttons)
    await page.locator('button[role="option"]').filter({ hasText: 'Admin' }).first().click();
    
    // Fill in credentials
    await page.fill('input[type="email"]', adminUser.email);
    await page.fill('input[type="password"]', adminUser.password);
    
    // Click sign in button
    await page.getByRole('button', { name: /^Sign in$/i }).click();
  }

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/dashboard/login');
    await loginAsAdmin(page);
    await page.fill('input[type="email"]', 'nonexistent@test.com');
    await page.fill('input[type="password"]', 'WrongPass123!');
    await page.getByRole('button', { name: /^Sign in$/i }).click();
    // Should show error message (from API or generic)
    await expect(page.locator('text=/failed|invalid|error|incorrect|credentials|must|exist/i')).toBeVisible({ timeout: 10000 });
  });

  test('login with valid admin credentials logs in and navigates', async ({ page }) => {
    await page.goto('/dashboard/login');
    await loginAsAdmin(page);
    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 15000 });
  });

  test('logged-in admin sees topbar with logout button', async ({ page }) => {
    await page.goto('/dashboard/login');
    await loginAsAdmin(page);
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 15000 });

    // Topbar elements - logout button should be visible
    const logoutBtn = page.getByRole('button', { name: /Log out/i });
    await expect(logoutBtn).toBeVisible();
    // The topbar shows the logged-in user name + role
    await expect(page.getByText('Admin User')).toBeVisible();
  });

  test('admin nav sidebar has all expected links', async ({ page }) => {
    await page.goto('/dashboard/login');
    await loginAsAdmin(page);
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 15000 });

    // Admin sidebar links (from NavSidebar.tsx)
    // Using exact: true to avoid partial matches
    const sidebarLinks = ['Dashboard', 'Hosts', { name: 'Guides', exact: true }, 'Support Tickets', 'Pages'];
    for (const link of sidebarLinks) {
      const options = typeof link === 'string' ? { name: link } : link;
      await expect(page.getByRole('link', options)).toBeVisible();
    }
  });

  test('admin sidebar navigation works', async ({ page }) => {
    await page.goto('/dashboard/login');
    await loginAsAdmin(page);
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 15000 });

    // Navigate to Guides (using exact: true to avoid partial match)
    await page.getByRole('link', { name: 'Guides', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/admin\/guides/);

    // Navigate back to Dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 5000 });
  });

  test('logout button clears session and redirects to login', async ({ page }) => {
    await page.goto('/dashboard/login');
    await loginAsAdmin(page);
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 15000 });

    await page.getByRole('button', { name: /Log out/i }).click();
    await expect(page).toHaveURL('/dashboard/login');
  });

  test('protected routes redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL('/dashboard/login');
  });

  test('forgot password button opens modal', async ({ page }) => {
    await page.goto('/dashboard/login');
    await page.locator('button').filter({ hasText: /Forgot password\?/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible({ timeout: 8000 });
  });
});
