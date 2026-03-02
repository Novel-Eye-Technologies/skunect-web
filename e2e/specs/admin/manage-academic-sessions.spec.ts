import { test, expect } from '../../fixtures/auth.fixture';
import { ManageTermsPage } from '../../pages/manage-terms.page';

test.describe('Academic Sessions - Advanced Operations', () => {
  test('session shows "Current" badge when set as current', async ({
    adminPage,
  }) => {
    const terms = new ManageTermsPage(adminPage);
    await terms.goto();
    await terms.expectVisible();

    // Look for a "Current" badge
    await expect(adminPage.getByText('Current').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('admin can select a session to view its terms', async ({
    adminPage,
  }) => {
    const terms = new ManageTermsPage(adminPage);
    await terms.goto();
    await terms.expectVisible();

    // Click the first session
    const firstSession = adminPage
      .locator('[class*="cursor-pointer"]')
      .first();
    await expect(firstSession).toBeVisible({ timeout: 10_000 });
    const sessionText = await firstSession.textContent();
    // Extract session name (e.g. "2025/2026") — it's the first text in the item
    const sessionName = sessionText?.match(/(\d{4}\/\d{4})/)?.[1] ?? sessionText?.trim();
    await firstSession.click();

    // Terms panel should show session name in header
    await expect(adminPage.getByText(`Terms — ${sessionName}`)).toBeVisible({
      timeout: 5_000,
    });
  });

  test('empty state shows when no session is selected', async ({
    adminPage,
  }) => {
    const terms = new ManageTermsPage(adminPage);
    await terms.goto();
    await terms.expectVisible();

    // Terms panel should show empty state heading
    await expect(
      adminPage.getByRole('heading', { name: /no session selected/i })
    ).toBeVisible({ timeout: 5_000 });
  });

  test('grading systems tab is accessible', async ({ adminPage }) => {
    await adminPage.goto('/school-settings');
    const gradingTab = adminPage.getByRole('tab', { name: 'Grading' });
    await expect(gradingTab).toBeVisible({ timeout: 15_000 });
    await gradingTab.click();

    // Should see grading systems heading
    await expect(
      adminPage.getByRole('heading', { name: 'Grading Systems' })
    ).toBeVisible({ timeout: 10_000 });
  });
});
