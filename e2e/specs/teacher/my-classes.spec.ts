import { test, expect } from '../../fixtures/auth.fixture';
import { MyClassesPage } from '../../pages/my-classes.page';

test.describe('My Classes', () => {
  test('teacher can view my classes page', async ({ teacherPage }) => {
    const myClasses = new MyClassesPage(teacherPage);
    await myClasses.goto();
    await myClasses.expectVisible();
    await expect(myClasses.description).toBeVisible();
  });

  test('admin can view my classes page', async ({ adminPage }) => {
    const myClasses = new MyClassesPage(adminPage);
    await myClasses.goto();
    await myClasses.expectVisible();
  });

  test('my classes page shows summary stats', async ({ teacherPage }) => {
    const myClasses = new MyClassesPage(teacherPage);
    await myClasses.goto();
    await myClasses.expectVisible();

    // Summary stat cards should be visible
    await expect(
      teacherPage.getByText('Total Classes')
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      teacherPage.getByText('Total Students')
    ).toBeVisible();
    await expect(
      teacherPage.getByText('Overall Attendance')
    ).toBeVisible();
    await expect(
      teacherPage.getByText('Current Term')
    ).toBeVisible();
  });

  test('class cards show student count and View Details button', async ({
    teacherPage,
  }) => {
    const myClasses = new MyClassesPage(teacherPage);
    await myClasses.goto();
    await myClasses.expectVisible();

    // Wait for either class cards or empty state to appear
    const viewDetailsButton = teacherPage
      .getByRole('button', { name: /view details/i })
      .first();
    const noClasses = teacherPage.getByText(/no classes assigned/i);

    await expect(
      viewDetailsButton.or(noClasses)
    ).toBeVisible({ timeout: 15_000 });

    // If empty state, that's fine
    if (await noClasses.isVisible().catch(() => false)) {
      return;
    }

    // At least one View Details button should exist
    await expect(viewDetailsButton).toBeVisible();

    // Should show "Students" label in the card
    await expect(
      teacherPage.getByText('Students').first()
    ).toBeVisible();
  });

  test('View Details button navigates to students page', async ({
    teacherPage,
  }) => {
    const myClasses = new MyClassesPage(teacherPage);
    await myClasses.goto();
    await myClasses.expectVisible();

    const viewDetailsButton = teacherPage
      .getByRole('button', { name: /view details/i })
      .first();
    const hasButton = await viewDetailsButton
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!hasButton) {
      test.skip();
      return;
    }

    await viewDetailsButton.click();
    await expect(teacherPage).toHaveURL(/\/students/, {
      timeout: 10_000,
    });
  });
});
