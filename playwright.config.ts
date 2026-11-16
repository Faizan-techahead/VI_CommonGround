import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { join } from 'node:path';

const envPath = join(__dirname, '.env');
if (existsSync(envPath)) loadEnvFile(envPath);

const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error('BASE_URL is required. Copy .env.example to .env and set the value.');
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: './test-results',
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: { mode: 'on', fullPage: true },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: ['--disable-features=HttpsFirstBalancedModeAutoEnable'],
        },
      },
    },
  ],
});
