/**
 * Captures screenshots of key pages for use on the marketing features page.
 *
 * ⚠️  GATED — this spec is OPT-IN and does not run by default.
 *
 * These tests write to `public/screenshots/` which is a committed marketing
 * asset directory. Running them incidentally (e.g. as part of the pre-push
 * hook or a full E2E sweep) dirties the working tree with non-deterministic
 * binary diffs from font/DPI rendering differences. To regenerate the
 * marketing screenshots intentionally, run:
 *
 *     CAPTURE_SCREENSHOTS=1 npx playwright test e2e/specs/screenshots/
 *
 * Then review the diff and commit the regenerated PNGs deliberately.
 *
 * Screenshots are saved to: public/screenshots/
 */
import { test, expect } from '../../fixtures/auth.fixture';
import path from 'path';

const CAPTURE_SCREENSHOTS = process.env.CAPTURE_SCREENSHOTS === '1';
const SKIP_REASON =
  'Screenshot capture is opt-in. Run `CAPTURE_SCREENSHOTS=1 npx playwright test e2e/specs/screenshots/` to regenerate marketing assets.';

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

// ─── Admin Screenshots (Skunect Academy) ────────────────────────────

test.describe('Admin screenshots', () => {
  test.skip(!CAPTURE_SCREENSHOTS, SKIP_REASON);

  test('dashboard', async ({ adminSkunectPage: page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-dashboard'));
  });

  test('students list', async ({ adminSkunectPage: page }) => {
    await page.goto('/students');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-students'));
  });

  test('attendance', async ({ adminSkunectPage: page }) => {
    await page.goto('/attendance');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-attendance'));
  });

  test('homework', async ({ adminSkunectPage: page }) => {
    await page.goto('/homework');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-homework'));
  });

  test('fees', async ({ adminSkunectPage: page }) => {
    await page.goto('/fees');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-fees'));
  });

  test('messages', async ({ adminSkunectPage: page }) => {
    await page.goto('/communication/messages');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-messages'));
  });

  test('safety alerts', async ({ adminSkunectPage: page }) => {
    await page.goto('/safety');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-safety'));
  });

  test('bus management', async ({ adminSkunectPage: page }) => {
    await page.goto('/bus');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-bus'));
  });

  test('school settings', async ({ adminSkunectPage: page }) => {
    await page.goto('/school-settings');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-settings'));
  });

  test('admins management', async ({ adminSkunectPage: page }) => {
    await page.goto('/admins');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-admins'));
  });

  test('analytics', async ({ adminSkunectPage: page }) => {
    await page.goto('/analytics');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('admin-analytics'));
  });
});

// ─── Teacher Screenshots (Skunect Academy) ──────────────────────────

test.describe('Teacher screenshots', () => {
  test.skip(!CAPTURE_SCREENSHOTS, SKIP_REASON);

  test('dashboard', async ({ teacherSkunectPage: page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-dashboard'));
  });

  test('my classes', async ({ teacherSkunectPage: page }) => {
    await page.goto('/my-classes');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-classes'));
  });

  test('attendance', async ({ teacherSkunectPage: page }) => {
    await page.goto('/attendance');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-attendance'));
  });

  test('homework', async ({ teacherSkunectPage: page }) => {
    await page.goto('/homework');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-homework'));
  });

  test('messages', async ({ teacherSkunectPage: page }) => {
    await page.goto('/communication/messages');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-messages'));
  });

  test('welfare', async ({ teacherSkunectPage: page }) => {
    await page.goto('/welfare');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('teacher-welfare'));
  });
});

// ─── Parent Screenshots (Skunect Academy) ───────────────────────────

test.describe('Parent screenshots', () => {
  test.skip(!CAPTURE_SCREENSHOTS, SKIP_REASON);

  test('dashboard', async ({ parentSkunectPage: page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-dashboard'));
  });

  test('academics / homework', async ({ parentSkunectPage: page }) => {
    await page.goto('/homework');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-homework'));
  });

  test('attendance', async ({ parentSkunectPage: page }) => {
    await page.goto('/attendance');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-attendance'));
  });

  test('fees', async ({ parentSkunectPage: page }) => {
    await page.goto('/fees');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-fees'));
  });

  test('messages', async ({ parentSkunectPage: page }) => {
    await page.goto('/communication/messages');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-messages'));
  });

  test('safety / pickup', async ({ parentSkunectPage: page }) => {
    await page.goto('/safety/pickup');
    await waitForPageLoad(page);
    await page.screenshot(screenshotOpts('parent-pickup'));
  });
});
