import { test, expect } from '../../fixtures/auth.fixture';
import { ManageTermsPage } from '../../pages/manage-terms.page';

test.describe('Sessions & Terms Management (CRUD)', () => {
  test('admin can view sessions & terms tab', async ({ adminPage }) => {
    const terms = new ManageTermsPage(adminPage);
    await terms.goto();
    await terms.expectVisible();
  });

  test('admin sees existing sessions', async ({ adminPage }) => {
    const terms = new ManageTermsPage(adminPage);
    await terms.goto();
    await terms.expectVisible();

    // Should see at least one session from seed data
    await expect(
      adminPage.locator('[class*="cursor-pointer"]').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('admin can create a new session', async ({ adminPage }) => {
    const terms = new ManageTermsPage(adminPage);
    await terms.goto();
    await terms.expectVisible();

    const sessionName = `${new Date().getFullYear() + 5}/${new Date().getFullYear() + 6}`;

    await terms.clickAddSession();
    await terms.fillSessionForm(sessionName, '2031-09-01', '2032-07-31');
    await terms.submitForm();

    await expect(terms.dialog).not.toBeVisible({ timeout: 5_000 });
    await terms.expectSessionVisible(sessionName);
  });

  test('admin can add a term to a session', async ({ adminPage }) => {
    const terms = new ManageTermsPage(adminPage);
    await terms.goto();
    await terms.expectVisible();

    // Select the first session
    const firstSession = adminPage
      .locator('[class*="cursor-pointer"]')
      .first();
    await firstSession.click();

    // Wait for terms panel to update
    await expect(adminPage.getByText(/^Terms —/)).toBeVisible({
      timeout: 5_000,
    });

    await terms.clickAddTerm();
    const termName = `E2E Term ${Date.now()}`;
    await terms.fillTermForm(termName, '2025-09-01', '2025-12-15');
    await terms.submitForm();

    await expect(terms.dialog).not.toBeVisible({ timeout: 5_000 });
    await terms.expectTermVisible(termName);
  });

  test('admin can delete a session', async ({ adminPage }) => {
    const terms = new ManageTermsPage(adminPage);
    await terms.goto();
    await terms.expectVisible();

    // Create a session to delete
    const deleteSession = `Delete ${Date.now()}`;
    await terms.clickAddSession();
    await terms.fillSessionForm(deleteSession, '2040-01-01', '2040-12-31');
    await terms.submitForm();
    await expect(terms.dialog).not.toBeVisible({ timeout: 5_000 });
    await terms.expectSessionVisible(deleteSession);

    // Delete it
    await terms.deleteSession(deleteSession);
    await expect(adminPage.getByText(deleteSession)).not.toBeVisible({
      timeout: 5_000,
    });
  });
});
