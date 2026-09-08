import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright E2E configuration for Guides Nepal.
 *
 * Dev servers (backend :8000, frontend :5173, dashboard :5176) are brought up
 * automatically if not already running (reuseExistingServer: true), so this
 * suite can be run on its own. The bundled Chromium build is used; if it is
 * missing, set USE_SYSTEM_CHROME=true to launch Google Chrome instead.
 */
const projectRoot = path.resolve(__dirname, '..');
const useSystemChrome = !!process.env.USE_SYSTEM_CHROME;

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 1,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  timeout: 60_000,
  expect: { timeout: 8_000 },
  use: {
    headless: true,
    ...(useSystemChrome ? { channel: 'chrome' } : {}),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'frontend',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
      },
      testMatch: /specs\/(home-buttons|auth|navigation)\.spec\.ts$/,
    },
    {
      name: 'dashboard',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5176',
      },
      testMatch: /specs\/dashboard\.spec\.ts$/,
    },
  ],
  webServer: [
    {
      command: 'npm run dev:backend',
      url: 'http://127.0.0.1:8000/health',
      reuseExistingServer: true,
      cwd: projectRoot,
      timeout: 120_000,
    },
    {
      command: 'npm run dev:frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      cwd: projectRoot,
      timeout: 120_000,
    },
    {
      command: 'npm run dev:dashboard',
      url: 'http://localhost:5176',
      reuseExistingServer: true,
      cwd: projectRoot,
      timeout: 120_000,
    },
  ],
});
