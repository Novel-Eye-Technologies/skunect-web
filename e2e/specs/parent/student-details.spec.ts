import { test, expect } from '../../fixtures/auth.fixture';
import { StudentsPage } from '../../pages/students.page';

test.describe('Student Details (Parent View)', () => {
  test('parent can view My Children page', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
  });

  test('parent sees their children in the list', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
    await students.expectTableNotEmpty();
  });

  test('parent does not see Add Student button', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();

    await expect(students.addStudentButton).not.toBeVisible({ timeout: 3_000 });
  });

  test('parent can navigate to student detail page', async ({
    parentPage,
  }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
    await students.expectTableNotEmpty();

    // Click on the first student to view details
    const firstRow = students.dataTable.locator('tbody tr').first();
    // Open row actions menu
    await firstRow.getByRole('button').last().click();
    // Click View Details
    await parentPage.getByRole('menuitem', { name: /view details/i }).click();

    // Should navigate to student detail page
    await expect(parentPage.locator('h1')).toBeVisible({ timeout: 15_000 });
  });

  test('student detail page shows profile tab with student info', async ({
    parentPage,
  }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
    await students.expectTableNotEmpty();

    // Navigate to first student
    const firstRow = students.dataTable.locator('tbody tr').first();
    await firstRow.getByRole('button').last().click();
    await parentPage.getByRole('menuitem', { name: /view details/i }).click();

    // Should see profile tab content
    await expect(parentPage.locator('h1')).toBeVisible({ timeout: 15_000 });
    await expect(
      parentPage.getByRole('tab', { name: /profile/i })
    ).toBeVisible();

    // Should see student information fields
    await expect(parentPage.getByText('Admission Number')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('student detail page shows parents tab', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
    await students.expectTableNotEmpty();

    // Navigate to first student
    const firstRow = students.dataTable.locator('tbody tr').first();
    await firstRow.getByRole('button').last().click();
    await parentPage.getByRole('menuitem', { name: /view details/i }).click();

    await expect(parentPage.locator('h1')).toBeVisible({ timeout: 15_000 });

    // Click Parents tab
    const parentsTab = parentPage.getByRole('tab', { name: /parents/i });
    await parentsTab.click();

    // Should show parent information or empty state
    const parentCard = parentPage.locator('[class*="card"]');
    const emptyState = parentPage.getByText(/no parents linked/i);
    await expect(parentCard.first().or(emptyState)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('cross-school parent sees children across schools', async ({
    parentCrossPage,
  }) => {
    const students = new StudentsPage(parentCrossPage);
    await students.goto();
    await students.expectVisible();
    await students.expectTableNotEmpty();
  });
});
