import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Skunect E2E tests.
 *
 * Run against the deployed app by default (configurable via E2E_BASE_URL).
 *
 * Usage:
 *   npm run test:e2e                       # all tests, headless
 *   npm run test:e2e:ui                    # interactive Playwright UI
 *   npm run test:e2e:headed                # headed browser
 *   npx playwright test path/to/spec.ts    # single file
 *   E2E_BASE_URL=http://localhost:3000 npm run test:e2e  # local dev
 */
export default defineConfig({
  testDir: './e2e/specs',
  globalSetup: './e2e/global-setup.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'on-failure' }]],

  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://dev.skunect.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
