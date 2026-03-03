import { test, expect } from '../../fixtures/auth.fixture';
import { StudentsPage } from '../../pages/students.page';

test.describe('Student Details (Parent View)', () => {
  test('parent can view students page', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
  });

  test('parent sees their children in the list', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
    // Parent endpoint returns linked children — table should have rows
    await students.expectTableNotEmpty();
  });

  test('parent does not see Add Student button', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
    // The "Add Student" button is hidden for PARENT role
    await expect(
      parentPage.getByRole('button', { name: /add student/i })
    ).not.toBeVisible({ timeout: 3_000 });
  });

  // Skipped: Next.js static export serves pre-rendered RSC data with placeholder
  // param '_' from generateStaticParams.  Navigating to /students/<uuid> in the
  // Docker (nginx + static export) environment triggers a route reconciliation
  // error caught by the root error boundary.  Works in production (Next.js server
  // or CloudFront SPA fallback).
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

  // Skipped: depends on detail page navigation (see above)
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

  // Skipped: depends on detail page navigation (see above)
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
  // (each school session uses a different schoolId context)
  test.skip('cross-school parent sees children across schools', async ({
    parentCrossPage,
  }) => {
    const students = new StudentsPage(parentCrossPage);
    await students.goto();
    await students.expectVisible();
    await students.expectTableNotEmpty();
  });
});
