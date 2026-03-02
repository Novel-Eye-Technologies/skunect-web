import { test, expect } from '../../fixtures/auth.fixture';
import { ManageSubjectsPage } from '../../pages/manage-subjects.page';

test.describe('Subjects Management (CRUD)', () => {
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

  test('subject table shows code and status columns', async ({
    adminPage,
  }) => {
    const subjects = new ManageSubjectsPage(adminPage);
    await subjects.goto();
    await subjects.expectVisible();
    await subjects.expectTableNotEmpty();

    // Verify table has expected headers
    const headers = subjects.dataTable.locator('thead th');
    await expect(headers.getByText('Name')).toBeVisible();
    await expect(headers.getByText('Code')).toBeVisible();
    await expect(headers.getByText('Status')).toBeVisible();
  });
});
