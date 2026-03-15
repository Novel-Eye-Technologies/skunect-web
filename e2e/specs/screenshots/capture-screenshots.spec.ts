/**
 * Captures screenshots of key pages for use on the marketing features page.
 * Run: npx playwright test e2e/specs/screenshots/capture-screenshots.spec.ts
 *
 * Screenshots are saved to: public/screenshots/
 */
import { test, expect } from '../../fixtures/auth.fixture';
import path from 'path';

const screenshotDir = path.resolve(
  __dirname,
  '../../../public/screenshots'
);

const screenshotOpts = (name: string) => ({
  path: path.join(screenshotDir, `${name}.png`),
  fullPage: false,
});

// Helper: wait for main content to load
async function waitForPageLoad(page: import('@playwright/test').Page) {
  // Wait for network to settle and at least one heading to appear
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

// ─── Admin Screenshots ───────────────────────────────────────────────

test.describe('Admin screenshots', () => {
  test('dashboard', async ({ adminPage: page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-dashboard'));
  });

  test('students list', async ({ adminPage: page }) => {
    await page.goto('/students');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-students'));
  });

  test('attendance', async ({ adminPage: page }) => {
    await page.goto('/attendance');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-attendance'));
  });

  test('homework', async ({ adminPage: page }) => {
    await page.goto('/homework');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-homework'));
  });

  test('fees', async ({ adminPage: page }) => {
    await page.goto('/fees');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-fees'));
  });

  test('messages', async ({ adminPage: page }) => {
    await page.goto('/messages');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-messages'));
  });

  test('safety alerts', async ({ adminPage: page }) => {
    await page.goto('/safety');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-safety'));
  });

  test('bus management', async ({ adminPage: page }) => {
    await page.goto('/bus');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-bus'));
  });

  test('school settings', async ({ adminPage: page }) => {
    await page.goto('/school-settings');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-settings'));
  });

  test('users management', async ({ adminPage: page }) => {
    await page.goto('/users');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-users'));
  });

  test('analytics', async ({ adminPage: page }) => {
    await page.goto('/analytics');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-analytics'));
  });
});

// ─── Teacher Screenshots ─────────────────────────────────────────────

test.describe('Teacher screenshots', () => {
  test('dashboard', async ({ teacherPage: page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-dashboard'));
  });

  test('my classes', async ({ teacherPage: page }) => {
    await page.goto('/my-classes');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-classes'));
  });

  test('attendance', async ({ teacherPage: page }) => {
    await page.goto('/attendance');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-attendance'));
  });

  test('homework', async ({ teacherPage: page }) => {
    await page.goto('/homework');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-homework'));
  });

  test('messages', async ({ teacherPage: page }) => {
    await page.goto('/messages');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-messages'));
  });

  test('welfare', async ({ teacherPage: page }) => {
    await page.goto('/welfare');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-welfare'));
  });
});

// ─── Parent Screenshots ──────────────────────────────────────────────

test.describe('Parent screenshots', () => {
  test('dashboard', async ({ parentPage: page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-dashboard'));
  });

  test('academics / homework', async ({ parentPage: page }) => {
    await page.goto('/homework');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-homework'));
  });

  test('attendance', async ({ parentPage: page }) => {
    await page.goto('/attendance');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-attendance'));
  });

  test('fees', async ({ parentPage: page }) => {
    await page.goto('/fees');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-fees'));
  });

  test('messages', async ({ parentPage: page }) => {
    await page.goto('/messages');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-messages'));
  });

  test('safety / pickup', async ({ parentPage: page }) => {
    await page.goto('/safety/pickup');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-pickup'));
  });
});
