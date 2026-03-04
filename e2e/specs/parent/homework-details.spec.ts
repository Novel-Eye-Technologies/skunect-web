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

  // Skipped: Next.js static export serves pre-rendered RSC data with placeholder
  // param '_' from generateStaticParams.  Navigating to /homework/<uuid> in the
  // Docker (nginx + static export) environment triggers a route reconciliation
  // error caught by the root error boundary.  Works in production with a Next.js
  // server or CloudFront SPA fallback.
  test.skip('parent can navigate to homework detail page', async ({
    parentPage,
  }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
    await homework.expectTableNotEmpty();

    // Click the first row's title link/button to navigate to detail
    const firstRow = homework.dataTable.locator('tbody tr').first();
    const titleCell = firstRow.locator('td').first();
    const clickable = titleCell.locator('a, button').first();
    const hasLink = await clickable.count();
    if (hasLink > 0) {
      await clickable.click();
    } else {
      // If no link/button, try clicking the row action menu → View Details
      await firstRow.getByRole('button').last().click();
      await parentPage.getByRole('menuitem', { name: /view/i }).click();
    }

    // Should navigate to detail page
    await expect(
      parentPage.getByRole('heading').first()
    ).toBeVisible({ timeout: 15_000 });
  });

  // Skipped: depends on detail page navigation (see above)
  test.skip('homework detail shows assignment information', async ({
    parentPage,
  }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
    await homework.expectTableNotEmpty();

    const firstRow = homework.dataTable.locator('tbody tr').first();
    const titleCell = firstRow.locator('td').first();
    const clickable = titleCell.locator('a, button').first();
    const hasLink = await clickable.count();
    if (hasLink > 0) {
      await clickable.click();
    } else {
      await firstRow.getByRole('button').last().click();
      await parentPage.getByRole('menuitem', { name: /view/i }).click();
    }

    // Detail page should show tabs or assignment metadata
    await expect(
      parentPage.getByRole('tab', { name: /details/i })
        .or(parentPage.getByText(/description/i))
    ).toBeVisible({ timeout: 15_000 });
  });

  // Skipped: depends on detail page navigation (see above)
  test.skip('homework detail shows submissions tab', async ({ parentPage }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
    await homework.expectTableNotEmpty();

    const firstRow = homework.dataTable.locator('tbody tr').first();
    const titleCell = firstRow.locator('td').first();
    const clickable = titleCell.locator('a, button').first();
    const hasLink = await clickable.count();
    if (hasLink > 0) {
      await clickable.click();
    } else {
      await firstRow.getByRole('button').last().click();
      await parentPage.getByRole('menuitem', { name: /view/i }).click();
    }

    await expect(
      parentPage.getByRole('tab', { name: /submissions/i })
    ).toBeVisible({ timeout: 15_000 });
    await parentPage.getByRole('tab', { name: /submissions/i }).click();

    const table = parentPage.locator('table');
    const emptyState = parentPage.getByText(/no submissions/i);
    await expect(table.or(emptyState)).toBeVisible({ timeout: 10_000 });
  });
});
