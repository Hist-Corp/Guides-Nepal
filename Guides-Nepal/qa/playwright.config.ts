import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Guides Nepal - QA E2E Configuration
 *
 * Dev servers (backend :8000, frontend :5175, dashboard :5176) are expected
 * to be running already (started via `npm run dev`). Set
 * QA_REUSE_EXISTING_SERVER=false to have Playwright spawn them.
 */

const projectRoot = path.resolve(__dirname, '..');
const reuseExistingServer = process.env.QA_REUSE_EXISTING_SERVER !== 'false';

export default defineConfig({
  testDir: './e2e',
  testIgnore: /_\./,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright-report', open: 'never' }],
    ['json', { outputFile: 'reports/playwright-results.json' }],
  ],
  timeout: 60000,
  expect: { timeout: 10000 },
  use: {
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 20000,
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },

  projects: [
    {
      name: 'frontend-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5175',
      },
    },
    {
      name: 'dashboard-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5176',
      },
    },
    {
      name: 'frontend-mobile',
      use: {
        ...devices['Pixel 5'],
        baseURL: 'http://localhost:5175',
      },
    },
  ],

  webServer: reuseExistingServer
    ? []
    : [
        {
          command: 'npm run dev:backend',
          url: 'http://127.0.0.1:8000/health',
          reuseExistingServer: true,
          cwd: projectRoot,
          timeout: 120000,
        },
        {
          command: 'npm run dev:frontend',
          url: 'http://localhost:5175',
          reuseExistingServer: true,
          cwd: projectRoot,
          timeout: 120000,
        },
        {
          command: 'npm run dev:dashboard',
          url: 'http://localhost:5176',
          reuseExistingServer: true,
          cwd: projectRoot,
          timeout: 120000,
        },
      ],
});