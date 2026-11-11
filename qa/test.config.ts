import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  use: { headless: true, baseURL: 'http://localhost:5175' },
  projects: [{ name: 'test', use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5175' } }],
});
