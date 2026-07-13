import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { resolveEnvironment } from './support/environment';

dotenv.config();

const env = resolveEnvironment();

const tagFilter = process.env.TEST_TAGS?.trim();

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,
  grep: tagFilter ? new RegExp(tagFilter) : undefined,
  reporter: [
    ['allure-playwright'],
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: env.baseUrl,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  outputDir: 'test-results/',
});
