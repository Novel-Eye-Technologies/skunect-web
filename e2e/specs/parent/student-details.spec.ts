import { test, expect } from '../../fixtures/auth.fixture';
import { StudentsPage } from '../../pages/students.page';

test.describe('Student Details (Parent View)', () => {
  test('parent can view students page', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
  });

  // Skipped: Frontend does not yet implement parent-specific student list
  // Backend has GET /parents/children but frontend uses GET /schools/{id}/students which is admin-only
  test.skip('parent sees their children in the list', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
    await students.expectTableNotEmpty();
  });

  // Skipped: Frontend does not yet implement role-based button visibility
  test.skip('parent does not see Add Student button', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
    await expect(students.addStudentButton).not.toBeVisible({ timeout: 3_000 });
  });

  // Skipped: Depends on parent-specific student list
  test.skip('parent can navigate to student detail page', async ({
    parentPage,
  }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
    await students.expectTableNotEmpty();

    const firstRow = students.dataTable.locator('tbody tr').first();
    await firstRow.getByRole('button').last().click();
    await parentPage.getByRole('menuitem', { name: /view details/i }).click();
    await expect(parentPage.locator('h1')).toBeVisible({ timeout: 15_000 });
  });

  // Skipped: Depends on parent-specific student list
  test.skip('student detail page shows profile tab with student info', async ({
    parentPage,
  }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
    await students.expectTableNotEmpty();

    const firstRow = students.dataTable.locator('tbody tr').first();
    await firstRow.getByRole('button').last().click();
    await parentPage.getByRole('menuitem', { name: /view details/i }).click();

    await expect(parentPage.locator('h1')).toBeVisible({ timeout: 15_000 });
    await expect(
      parentPage.getByRole('tab', { name: /profile/i })
    ).toBeVisible();
    await expect(parentPage.getByText('Admission Number')).toBeVisible({
      timeout: 10_000,
    });
  });

  // Skipped: Depends on parent-specific student list
  test.skip('student detail page shows parents tab', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
    await students.expectTableNotEmpty();

    const firstRow = students.dataTable.locator('tbody tr').first();
    await firstRow.getByRole('button').last().click();
    await parentPage.getByRole('menuitem', { name: /view details/i }).click();

    await expect(parentPage.locator('h1')).toBeVisible({ timeout: 15_000 });
    const parentsTab = parentPage.getByRole('tab', { name: /parents/i });
    await parentsTab.click();

    const parentCard = parentPage.locator('[class*="card"]');
    const emptyState = parentPage.getByText(/no parents linked/i);
    await expect(parentCard.first().or(emptyState)).toBeVisible({
      timeout: 10_000,
    });
  });

  // Skipped: Frontend doesn't support cross-school parent view yet
  test.skip('cross-school parent sees children across schools', async ({
    parentCrossPage,
  }) => {
    const students = new StudentsPage(parentCrossPage);
    await students.goto();
    await students.expectVisible();
    await students.expectTableNotEmpty();
  });
});
