import fs from 'fs';
import path from 'path';
import { test, expect } from '../../fixtures/auth.fixture';
import { ManageSubjectsPage } from '../../pages/manage-subjects.page';
import { apiGet, apiDelete } from '../../helpers/api.helper';

test.describe('Subjects Management (CRUD)', () => {
  // Clean up E2E test subjects from previous runs
  test.beforeAll(async () => {
    try {
      const authFile = path.resolve(process.cwd(), '.auth/admin-kings.json');
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      const zustand = JSON.parse(authData.origins[0].localStorage[0].value);
      const token = zustand.state.accessToken as string;
      const schoolId = zustand.state.currentSchoolId as string;

      const res = await apiGet<Array<{ id: string; name: string }>>(
        `/schools/${schoolId}/subjects?size=200`,
        token
      );
      const stale = (res.data ?? []).filter(
        (s) =>
          s.name.startsWith('E2E Subject') ||
          s.name.startsWith('Delete Subject')
      );
      for (const s of stale) {
        await apiDelete(
          `/schools/${schoolId}/subjects/${s.id}`,
          token
        ).catch(() => {});
      }
    } catch {
      // best-effort
    }
  });

  test('admin can view subjects tab', async ({ adminPage }) => {
    const subjects = new ManageSubjectsPage(adminPage);
    await subjects.goto();
    await subjects.expectVisible();
  });

  test('admin sees existing subjects in table', async ({ adminPage }) => {
    const subjects = new ManageSubjectsPage(adminPage);
    await subjects.goto();
    await subjects.expectVisible();
    await subjects.expectTableNotEmpty();
  });

  test('admin can create a new subject', async ({ adminPage }) => {
    const subjects = new ManageSubjectsPage(adminPage);
    await subjects.goto();
    await subjects.expectVisible();

    const uniqueSubject = `E2E Subject ${Date.now()}`;
    const uniqueCode = `E2E${Date.now().toString().slice(-4)}`;

    await subjects.clickAddSubject();
    await subjects.fillSubjectForm(
      uniqueSubject,
      uniqueCode,
      'Auto-generated test subject'
    );
    await subjects.submitForm();

    await expect(subjects.dialog).not.toBeVisible({ timeout: 5_000 });
    await subjects.expectSubjectInTable(uniqueSubject);
  });

  test('admin can edit a subject', async ({ adminPage }) => {
    const subjects = new ManageSubjectsPage(adminPage);
    await subjects.goto();
    await subjects.expectVisible();
    await subjects.expectTableNotEmpty();

    // Edit the first subject — use page object to target Actions column
    const firstName = await subjects.dataTable
      .locator('tbody tr')
      .first()
      .locator('td')
      .first()
      .textContent();
    await subjects.editSubject(firstName!.trim());

    // Clear and update the description
    await subjects.descriptionInput.fill('Updated description via E2E');
    await subjects.submitForm();

    await expect(subjects.dialog).not.toBeVisible({ timeout: 5_000 });
  });

  test('admin can delete a subject', async ({ adminPage }) => {
    const subjects = new ManageSubjectsPage(adminPage);
    await subjects.goto();
    await subjects.expectVisible();

    // Create a subject to delete
    const deleteSubject = `Delete Subject ${Date.now()}`;
    const deleteCode = `DEL${Date.now().toString().slice(-4)}`;

    await subjects.clickAddSubject();
    await subjects.fillSubjectForm(deleteSubject, deleteCode);
    await subjects.submitForm();
    await expect(subjects.dialog).not.toBeVisible({ timeout: 5_000 });
    await subjects.expectSubjectInTable(deleteSubject);

    // Delete it
    await subjects.deleteSubject(deleteSubject);
    await subjects.expectSubjectNotInTable(deleteSubject);
  });

  test('subject table shows expected columns without Status', async ({
    adminPage,
  }) => {
    const subjects = new ManageSubjectsPage(adminPage);
    await subjects.goto();
    await subjects.expectVisible();
    await subjects.expectTableNotEmpty();

    // Verify table has expected headers: Name, Code, Description, Actions
    const headers = subjects.dataTable.locator('thead th');
    await expect(headers.getByText('Name')).toBeVisible();
    await expect(headers.getByText('Code')).toBeVisible();

    // Status column was removed — verify it's gone
    const headerTexts: string[] = [];
    const count = await headers.count();
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      if (text) headerTexts.push(text.trim());
    }
    expect(headerTexts).not.toContain('Status');
  });

  test('cancel button closes dialog without saving', async ({
    adminPage,
  }) => {
    const subjects = new ManageSubjectsPage(adminPage);
    await subjects.goto();
    await subjects.expectVisible();

    await subjects.clickAddSubject();
    await subjects.fillSubjectForm('Should Not Save', 'NOSAVE');
    await subjects.cancelButton.click();

    await expect(subjects.dialog).not.toBeVisible({ timeout: 3_000 });
  });
});
