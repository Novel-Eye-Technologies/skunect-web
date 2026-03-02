import { test, expect } from '../../fixtures/auth.fixture';
import { HomeworkPage } from '../../pages/homework.page';

test.describe('Homework Details (Parent View)', () => {
  test('parent can view homework page', async ({ parentPage }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
  });

  test('parent does not see Create Assignment button', async ({
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

  test('parent can navigate to homework detail page', async ({
    parentPage,
  }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
    await homework.expectTableNotEmpty();

    // Click on the first homework title (which should be a link)
    const firstRow = homework.dataTable.locator('tbody tr').first();
    const titleLink = firstRow.locator('a').first();
    const titleText = await titleLink.textContent();
    await titleLink.click();

    // Should navigate to detail page
    await expect(
      parentPage.getByRole('heading', { name: titleText!.trim() })
    ).toBeVisible({ timeout: 15_000 });
  });

  test('homework detail shows assignment information', async ({
    parentPage,
  }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
    await homework.expectTableNotEmpty();

    // Navigate to first homework detail
    const firstLink = homework.dataTable.locator('tbody tr a').first();
    await firstLink.click();

    // Should see Details tab with assignment info
    await expect(
      parentPage.getByRole('tab', { name: /details/i })
    ).toBeVisible({ timeout: 15_000 });

    // Verify assignment information fields
    await expect(parentPage.getByText('Class')).toBeVisible({
      timeout: 10_000,
    });
    await expect(parentPage.getByText('Subject')).toBeVisible();
    await expect(parentPage.getByText('Max Score')).toBeVisible();
  });

  test('homework detail shows submissions tab', async ({ parentPage }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
    await homework.expectTableNotEmpty();

    // Navigate to first homework detail
    const firstLink = homework.dataTable.locator('tbody tr a').first();
    await firstLink.click();

    // Should see Submissions tab
    await expect(
      parentPage.getByRole('tab', { name: /submissions/i })
    ).toBeVisible({ timeout: 15_000 });

    // Click on Submissions tab
    await parentPage.getByRole('tab', { name: /submissions/i }).click();

    // Should show submissions table or empty state
    const table = parentPage.locator('table');
    const emptyState = parentPage.getByText(/no submissions/i);
    await expect(table.or(emptyState)).toBeVisible({ timeout: 10_000 });
  });
});
