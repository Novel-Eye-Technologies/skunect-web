import { test, expect } from '../../fixtures/auth.fixture';
import { TeachersPage } from '../../pages/teachers.page';

test.describe('Teachers Management CRUD (Admin)', () => {
  test('admin can view teachers page with data', async ({ adminPage }) => {
    const teachers = new TeachersPage(adminPage);
    await teachers.goto();
    await teachers.expectVisible();
    await expect(teachers.description).toBeVisible();
    await expect(teachers.inviteTeacherButton).toBeVisible();
    await teachers.expectTableNotEmpty();
  });

  test('admin can search for teachers', async ({ adminPage }) => {
    const teachers = new TeachersPage(adminPage);
    await teachers.goto();
    await teachers.expectVisible();
    await teachers.expectTableNotEmpty();

    // Get a teacher name from the table to search for
    const firstRow = teachers.dataTable.locator('tbody tr').first();
    const teacherName = await firstRow.locator('td').first().textContent();

    if (teacherName) {
      const searchTerm = teacherName.trim().split(' ')[0]; // first name
      await teachers.search(searchTerm);
      await adminPage.waitForTimeout(1_000);

      // Should still see results
      await teachers.expectTableNotEmpty();
      await teachers.expectTeacherInTable(searchTerm);

      // Clear search
      await teachers.clearSearch();
    }
  });

  test('admin can open edit teacher dialog', async ({ adminPage }) => {
    const teachers = new TeachersPage(adminPage);
    await teachers.goto();
    await teachers.expectVisible();
    await teachers.expectTableNotEmpty();

    const firstRow = teachers.dataTable.locator('tbody tr').first();
    const teacherName = await firstRow.locator('td').first().textContent();

    if (teacherName) {
      await teachers.clickEditDetails(teacherName.trim());

      // Dialog should show "Edit User" title
      await expect(
        teachers.dialog.getByRole('heading', { name: /edit user/i })
      ).toBeVisible();

      // Email field should be visible and disabled (plain label + disabled input)
      const emailInput = teachers.dialog.locator('input[disabled]').first();
      await expect(emailInput).toBeVisible();

      // Cancel without changes
      await teachers.cancelDialog();
      await expect(teachers.dialog).not.toBeVisible({ timeout: 3_000 });
    }
  });

  test('admin sees all action menu items for a teacher', async ({
    adminPage,
  }) => {
    const teachers = new TeachersPage(adminPage);
    await teachers.goto();
    await teachers.expectVisible();
    await teachers.expectTableNotEmpty();

    const firstRow = teachers.dataTable.locator('tbody tr').first();
    const teacherName = await firstRow.locator('td').first().textContent();

    if (teacherName) {
      await teachers.openActionsMenu(teacherName.trim());

      await expect(
        adminPage.getByRole('menuitem', { name: /edit details/i })
      ).toBeVisible();
      await expect(
        adminPage.getByRole('menuitem', { name: /assign class/i })
      ).toBeVisible();
      await expect(
        adminPage.getByRole('menuitem', { name: /change status/i })
      ).toBeVisible();
      await expect(
        adminPage.getByRole('menuitem', { name: /remove teacher/i })
      ).toBeVisible();

      await adminPage.keyboard.press('Escape');
    }
  });

  test('admin can open change status dialog for a teacher', async ({
    adminPage,
  }) => {
    const teachers = new TeachersPage(adminPage);
    await teachers.goto();
    await teachers.expectVisible();
    await teachers.expectTableNotEmpty();

    const firstRow = teachers.dataTable.locator('tbody tr').first();
    const teacherName = await firstRow.locator('td').first().textContent();

    if (teacherName) {
      await teachers.clickChangeStatus(teacherName.trim());

      // Status dialog should be visible
      await expect(teachers.dialog).toBeVisible();

      // Cancel without changes
      await teachers.cancelDialog();
      await expect(teachers.dialog).not.toBeVisible({ timeout: 3_000 });
    }
  });

  test('admin can open remove teacher confirmation', async ({
    adminPage,
  }) => {
    const teachers = new TeachersPage(adminPage);
    await teachers.goto();
    await teachers.expectVisible();
    await teachers.expectTableNotEmpty();

    const firstRow = teachers.dataTable.locator('tbody tr').first();
    const teacherName = await firstRow.locator('td').first().textContent();

    if (teacherName) {
      await teachers.clickRemoveTeacher(teacherName.trim());

      // Alert dialog should be visible with "Remove Teacher" title
      await expect(
        teachers.alertDialog.getByText(/remove teacher/i)
      ).toBeVisible();

      // Cancel without removing
      await teachers.cancelRemove();
    }
  });
});
