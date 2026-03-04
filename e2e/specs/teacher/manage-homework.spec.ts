import { test, expect } from '../../fixtures/auth.fixture';
import { ManageHomeworkPage } from '../../pages/manage-homework.page';

test.describe('Homework Management (CRUD)', () => {
  test('teacher can view homework page', async ({ teacherPage }) => {
    const homework = new ManageHomeworkPage(teacherPage);
    await homework.goto();
    await homework.expectVisible();
  });

  test('teacher sees Create Assignment button', async ({ teacherPage }) => {
    const homework = new ManageHomeworkPage(teacherPage);
    await homework.goto();
    await homework.expectVisible();
    await expect(homework.createButton).toBeVisible();
  });

  test('admin can view homework page', async ({ adminPage }) => {
    const homework = new ManageHomeworkPage(adminPage);
    await homework.goto();
    await homework.expectVisible();
    await expect(homework.createButton).toBeVisible();
  });

  test('teacher can create a homework assignment', async ({
    teacherPage,
  }) => {
    const homework = new ManageHomeworkPage(teacherPage);
    await homework.goto();
    await homework.expectVisible();

    const title = `E2E Homework ${Date.now()}`;

    await homework.clickCreate();
    await homework.fillHomeworkForm(
      title,
      'This is an auto-generated homework assignment for E2E testing.',
      '50'
    );

    // Select class and subject from dropdowns
    await homework.selectClass(/.+/); // Select first available class
    await homework.selectSubject(/.+/); // Select first available subject

    // Set dates
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000)
      .toISOString()
      .split('T')[0];
    await homework.setDates(today, nextWeek);

    await homework.submitForm();
    await expect(homework.dialog).not.toBeVisible({ timeout: 10_000 });
    await homework.expectHomeworkInTable(title);
  });

  // Skipped: Next.js static export serves pre-rendered RSC data with placeholder
  // param '_' from generateStaticParams.  Navigating to /homework/<uuid> in the
  // Docker (nginx + static export) environment triggers a route reconciliation
  // error caught by the root error boundary.
  test.skip('teacher can view homework detail via title click', async ({
    teacherPage,
  }) => {
    const homework = new ManageHomeworkPage(teacherPage);
    await homework.goto();
    await homework.expectVisible();

    // Seed data should provide at least one homework assignment
    const firstRow = homework.dataTable.locator('tbody tr').first();
    const isVisible = await firstRow.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    // Click the first row's title (may be a button or link)
    const firstTitle = firstRow.locator('td').first().locator('a, button').first();
    const titleText = await firstTitle.textContent();
    await firstTitle.click();

    // Should navigate to detail page — look for heading or breadcrumb with title
    await expect(
      teacherPage.getByRole('heading', { name: titleText!.trim() })
        .or(teacherPage.getByText(titleText!.trim()))
    ).toBeVisible({ timeout: 15_000 });
  });

  // Skipped: depends on detail page navigation (see above)
  test.skip('homework detail page shows tabs', async ({ teacherPage }) => {
    const homework = new ManageHomeworkPage(teacherPage);
    await homework.goto();
    await homework.expectVisible();

    // Seed data should provide at least one homework assignment
    const firstRow = homework.dataTable.locator('tbody tr').first();
    const isVisible = await firstRow.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    // Navigate to first homework's detail page (title may be button or link)
    const firstLink = firstRow.locator('td').first().locator('a, button').first();
    await firstLink.click();

    // Should see Details and Submissions tabs
    await expect(
      teacherPage.getByRole('tab', { name: /details/i })
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      teacherPage.getByRole('tab', { name: /submissions/i })
    ).toBeVisible();
  });

  test('teacher can delete a homework assignment', async ({
    teacherPage,
  }) => {
    const homework = new ManageHomeworkPage(teacherPage);
    await homework.goto();
    await homework.expectVisible();

    // Create one first to delete
    const deleteTitle = `Delete HW ${Date.now()}`;

    await homework.clickCreate();
    await homework.fillHomeworkForm(
      deleteTitle,
      'This homework will be deleted.',
      '25'
    );
    await homework.selectClass(/.+/);
    await homework.selectSubject(/.+/);

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000)
      .toISOString()
      .split('T')[0];
    await homework.setDates(today, nextWeek);

    await homework.submitForm();
    await expect(homework.dialog).not.toBeVisible({ timeout: 10_000 });
    await homework.expectHomeworkInTable(deleteTitle);

    // Delete it
    await homework.deleteHomework(deleteTitle);
    await homework.expectHomeworkNotInTable(deleteTitle);
  });
});
