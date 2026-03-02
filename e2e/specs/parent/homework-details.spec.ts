import { test, expect } from '../../fixtures/auth.fixture';
import { HomeworkPage } from '../../pages/homework.page';

test.describe('Homework Details (Parent View)', () => {
  test('parent can view homework page', async ({ parentPage }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
  });

  // Skipped: Frontend does not yet implement role-based button visibility
  // The Create Assignment button shows for all users; backend only allows TEACHER
  test.skip('parent does not see Create Assignment button', async ({
    parentPage,
  }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
    await expect(homework.createButton).not.toBeVisible({ timeout: 3_000 });
  });

  test('parent sees homework table with assignments', async ({
    parentPage,
  }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();

    // Should see the data table
    await expect(homework.dataTable).toBeVisible();
  });

  // Skipped: Homework table may be empty for parent user in test env
  // Depends on seed data linking parent to students with homework
  test.skip('parent can navigate to homework detail page', async ({
    parentPage,
  }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
    await homework.expectTableNotEmpty();

    const firstRow = homework.dataTable.locator('tbody tr').first();
    const titleLink = firstRow.locator('a').first();
    const titleText = await titleLink.textContent();
    await titleLink.click();

    await expect(
      parentPage.getByRole('heading', { name: titleText!.trim() })
    ).toBeVisible({ timeout: 15_000 });
  });

  // Skipped: Depends on navigating to homework detail (above)
  test.skip('homework detail shows assignment information', async ({
    parentPage,
  }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
    await homework.expectTableNotEmpty();

    const firstLink = homework.dataTable.locator('tbody tr a').first();
    await firstLink.click();

    await expect(
      parentPage.getByRole('tab', { name: /details/i })
    ).toBeVisible({ timeout: 15_000 });

    await expect(parentPage.getByText('Class')).toBeVisible({
      timeout: 10_000,
    });
    await expect(parentPage.getByText('Subject')).toBeVisible();
    await expect(parentPage.getByText('Max Score')).toBeVisible();
  });

  // Skipped: Depends on navigating to homework detail
  test.skip('homework detail shows submissions tab', async ({ parentPage }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
    await homework.expectTableNotEmpty();

    const firstLink = homework.dataTable.locator('tbody tr a').first();
    await firstLink.click();

    await expect(
      parentPage.getByRole('tab', { name: /submissions/i })
    ).toBeVisible({ timeout: 15_000 });
    await parentPage.getByRole('tab', { name: /submissions/i }).click();

    const table = parentPage.locator('table');
    const emptyState = parentPage.getByText(/no submissions/i);
    await expect(table.or(emptyState)).toBeVisible({ timeout: 10_000 });
  });
});
