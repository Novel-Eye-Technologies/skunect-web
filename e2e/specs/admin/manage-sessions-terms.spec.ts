import fs from 'fs';
import path from 'path';
import { test, expect } from '../../fixtures/auth.fixture';
import { ManageTermsPage } from '../../pages/manage-terms.page';
import { apiGet, apiDelete } from '../../helpers/api.helper';

// Sequential: session create → edit → add term → edit term → overlap → delete depend on each other
test.describe.serial('Academic Sessions & Terms CRUD (Admin)', () => {
  const uniqueSessionName = `E2E Session ${Date.now()}`;
  // Use future dates to avoid conflicts with existing sessions
  const sessionStartDate = '2030-01-01';
  const sessionEndDate = '2030-12-31';
  const termStartDate = '2030-01-01';
  const termEndDate = '2030-04-30';
  const term2StartDate = '2030-05-01';
  const term2EndDate = '2030-08-31';
  const uniqueTermName = `E2E First Term ${Date.now()}`;

  // Clean up E2E sessions from previous runs
  test.beforeAll(async () => {
    try {
      const authFile = path.resolve(process.cwd(), '.auth/admin-kings.json');
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      const zustand = JSON.parse(authData.origins[0].localStorage[0].value);
      const token = zustand.state.accessToken as string;
      const schoolId = zustand.state.currentSchoolId as string;

      const res = await apiGet<Array<{ id: string; name: string }>>(
        `/schools/${schoolId}/sessions?size=200`,
        token
      );
      const stale = (res.data ?? []).filter((s) =>
        s.name.startsWith('E2E Session')
      );
      for (const s of stale) {
        await apiDelete(
          `/schools/${schoolId}/sessions/${s.id}`,
          token
        ).catch(() => {});
      }
    } catch {
      // best-effort
    }
  });

  // --- Session tests ---

  test('admin can view sessions & terms tab', async ({ adminPage }) => {
    const sessions = new ManageTermsPage(adminPage);
    await sessions.goto();
    await sessions.expectVisible();
  });

  test('admin can create a new session', async ({ adminPage }) => {
    const sessions = new ManageTermsPage(adminPage);
    await sessions.goto();
    await sessions.expectVisible();

    await sessions.clickAddSession();
    await sessions.fillSessionForm(
      uniqueSessionName,
      sessionStartDate,
      sessionEndDate
    );
    await sessions.submitForm();

    await expect(sessions.dialog).not.toBeVisible({ timeout: 10_000 });
    await sessions.expectSessionVisible(uniqueSessionName);
  });

  test('admin can edit a session', async ({ adminPage }) => {
    const sessions = new ManageTermsPage(adminPage);
    await sessions.goto();
    await sessions.expectVisible();

    await sessions.editSession(uniqueSessionName);
    // Just update the name slightly
    await sessions.dialog
      .getByPlaceholder('e.g. 2024/2025')
      .fill(`${uniqueSessionName} Updated`);
    await sessions.submitForm();

    await expect(sessions.dialog).not.toBeVisible({ timeout: 10_000 });
    await sessions.expectSessionVisible(`${uniqueSessionName} Updated`);
  });

  // --- Term tests ---

  test('admin can select a session and add a term', async ({ adminPage }) => {
    const sessions = new ManageTermsPage(adminPage);
    await sessions.goto();
    await sessions.expectVisible();

    // Select the session we created
    await sessions.selectSession(`${uniqueSessionName} Updated`);

    // Add a term
    await sessions.clickAddTerm();
    await sessions.fillTermForm(uniqueTermName, termStartDate, termEndDate);
    await sessions.submitForm();

    await expect(sessions.dialog).not.toBeVisible({ timeout: 10_000 });
    await sessions.expectTermVisible(uniqueTermName);
  });

  test('admin can edit a term', async ({ adminPage }) => {
    const sessions = new ManageTermsPage(adminPage);
    await sessions.goto();
    await sessions.expectVisible();

    await sessions.selectSession(`${uniqueSessionName} Updated`);
    await sessions.expectTermVisible(uniqueTermName);

    await sessions.editTerm(uniqueTermName);
    // Update the end date
    const dateInputs = sessions.dialog.locator('input[type="date"]');
    await dateInputs.last().fill('2030-04-15');
    await sessions.submitForm();

    await expect(sessions.dialog).not.toBeVisible({ timeout: 10_000 });
  });

  test('admin cannot create overlapping terms', async ({ adminPage }) => {
    const sessions = new ManageTermsPage(adminPage);
    await sessions.goto();
    await sessions.expectVisible();

    await sessions.selectSession(`${uniqueSessionName} Updated`);
    await sessions.expectTermVisible(uniqueTermName);

    // Try to add a term that overlaps with the existing one
    await sessions.clickAddTerm();
    const overlappingTermName = `Overlapping Term ${Date.now()}`;
    // Use dates that overlap with the first term (Jan 1 - Apr 15)
    await sessions.fillTermForm(overlappingTermName, '2030-02-01', '2030-05-01');
    await sessions.submitForm();

    // Should see a toast/validation error about overlap
    // The dialog should remain open because submission was blocked
    await adminPage.waitForTimeout(2_000);
    // Check for toast message about overlap
    const toastText = adminPage.getByText(/overlap/i);
    const dialogStillOpen = await sessions.dialog
      .isVisible()
      .catch(() => false);
    // Either a toast appeared or the dialog stayed open (validation prevented submission)
    expect(
      (await toastText.isVisible().catch(() => false)) || dialogStillOpen
    ).toBe(true);

    // Close dialog if still open
    if (dialogStillOpen) {
      await sessions.dialog
        .getByRole('button', { name: /cancel/i })
        .click()
        .catch(() => {});
    }
  });

  test('admin can delete a term', async ({ adminPage }) => {
    const sessions = new ManageTermsPage(adminPage);
    await sessions.goto();
    await sessions.expectVisible();

    await sessions.selectSession(`${uniqueSessionName} Updated`);
    await sessions.expectTermVisible(uniqueTermName);

    await sessions.deleteTerm(uniqueTermName);
    // Term should be removed
    await expect(adminPage.getByText(uniqueTermName)).not.toBeVisible({
      timeout: 5_000,
    });
  });

  // --- Session delete (cleanup) ---

  test('admin can delete a session', async ({ adminPage }) => {
    const sessions = new ManageTermsPage(adminPage);
    await sessions.goto();
    await sessions.expectVisible();

    await sessions.deleteSession(`${uniqueSessionName} Updated`);
    await expect(
      adminPage.getByText(`${uniqueSessionName} Updated`)
    ).not.toBeVisible({ timeout: 5_000 });
  });
});
