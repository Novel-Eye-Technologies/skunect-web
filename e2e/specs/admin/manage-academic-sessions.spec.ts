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
    const sessionName = await firstSession.locator('.font-medium').textContent();
    await firstSession.click();

    // Terms panel should show session name
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

    // Terms panel should show empty state initially
    await expect(
      adminPage.getByText('Select a session to view its terms')
    ).toBeVisible({ timeout: 5_000 });
  });

  test('grading systems tab is accessible', async ({ adminPage }) => {
    await adminPage.goto('/school-settings');
    const gradingTab = adminPage.getByRole('tab', { name: 'Grading' });
    await expect(gradingTab).toBeVisible({ timeout: 15_000 });
    await gradingTab.click();

    // Should see grading systems heading
    await expect(
      adminPage.getByText('Grading Systems')
    ).toBeVisible({ timeout: 10_000 });
  });
});
