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

    // Create a dedicated session so we know the exact date range
    const suffix = Date.now().toString().slice(-6);
    const sessionName = `Term Test ${suffix}`;
    await terms.clickAddSession();
    await terms.fillSessionForm(sessionName, '2042-01-01', '2042-12-31');
    await terms.submitForm();
    await expect(terms.dialog).not.toBeVisible({ timeout: 10_000 });
    await terms.expectSessionVisible(sessionName);

    // Select the session we just created
    await terms.selectSession(sessionName);

    // Wait for terms panel to update
    await expect(adminPage.getByText(/Terms —/)).toBeVisible({
      timeout: 5_000,
    });

    // Now add a term within the session's date range
    await terms.clickAddTerm();
    const termName = `E2E Term ${suffix}`;
    await terms.fillTermForm(termName, '2042-01-15', '2042-04-30');
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
