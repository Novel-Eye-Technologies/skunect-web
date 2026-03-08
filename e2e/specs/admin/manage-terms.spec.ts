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

    // Use a truly unique name with timestamp to avoid duplicate key constraint
    const uniqueSuffix = Date.now().toString().slice(-6);
    const sessionName = `E2E ${uniqueSuffix}`;

    await terms.clickAddSession();
    await terms.fillSessionForm(sessionName, '2040-09-01', '2041-07-31');
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

    // Wait for terms panel to update — header changes from "Terms" to "Terms — {name}"
    await expect(adminPage.getByText(/Terms —/)).toBeVisible({
      timeout: 5_000,
    });

    await terms.clickAddTerm();
    const termName = `E2E Term ${Date.now()}`;
    await terms.fillTermForm(termName, '2040-09-01', '2040-12-15');
    await terms.submitForm();

    await expect(terms.dialog).not.toBeVisible({ timeout: 10_000 });
    await terms.expectTermVisible(termName);
  });

  // Backend does not yet support DELETE /sessions/{id} endpoint — skip until implemented
  test.skip('admin can delete a session', async ({ adminPage }) => {
    const terms = new ManageTermsPage(adminPage);
    await terms.goto();
    await terms.expectVisible();

    const uniqueSuffix = Date.now().toString().slice(-6);
    const deleteSession = `Del ${uniqueSuffix}`;
    await terms.clickAddSession();
    await terms.fillSessionForm(deleteSession, '2045-01-01', '2045-12-31');
    await terms.submitForm();
    await expect(terms.dialog).not.toBeVisible({ timeout: 5_000 });
    await terms.expectSessionVisible(deleteSession);

    await terms.deleteSession(deleteSession);
    await expect(adminPage.getByText(deleteSession)).not.toBeVisible({
      timeout: 5_000,
    });
  });
});
