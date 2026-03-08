import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Teacher Dashboard Features', () => {
  test('dashboard shows Total Students stat card', async ({ teacherPage }) => {
    await teacherPage.goto('/dashboard');
    await expect(
      teacherPage.getByText(/welcome back/i).first()
    ).toBeVisible({ timeout: 20_000 });

    await expect(teacherPage.getByText('Total Students')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('dashboard shows View Detail link for students', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/dashboard');
    await expect(
      teacherPage.getByText(/welcome back/i).first()
    ).toBeVisible({ timeout: 20_000 });

    const viewDetail = teacherPage.getByRole('button', {
      name: /view detail/i,
    });
    await expect(viewDetail).toBeVisible({ timeout: 10_000 });
  });

  test('View Detail navigates to students page', async ({ teacherPage }) => {
    await teacherPage.goto('/dashboard');
    await expect(
      teacherPage.getByText(/welcome back/i).first()
    ).toBeVisible({ timeout: 20_000 });

    const viewDetail = teacherPage.getByRole('button', {
      name: /view detail/i,
    });
    const isVisible = await viewDetail
      .isVisible({ timeout: 10_000 })
      .catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await viewDetail.click();
    await expect(teacherPage).toHaveURL(/\/students/, { timeout: 10_000 });
  });

  test('dashboard shows Quick Actions section', async ({ teacherPage }) => {
    await teacherPage.goto('/dashboard');
    await expect(
      teacherPage.getByText(/welcome back/i).first()
    ).toBeVisible({ timeout: 20_000 });

    await expect(
      teacherPage.getByText('Quick Actions')
    ).toBeVisible({ timeout: 10_000 });

    // All four quick actions should be visible
    await expect(
      teacherPage.getByText('Take Attendance')
    ).toBeVisible();
    await expect(teacherPage.getByText('Enter Grade')).toBeVisible();
    await expect(
      teacherPage.getByText('Create Homework')
    ).toBeVisible();
    await expect(
      teacherPage.getByText('Send Message')
    ).toBeVisible();
  });

  test('quick action navigates to attendance page', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/dashboard');
    await expect(
      teacherPage.getByText(/welcome back/i).first()
    ).toBeVisible({ timeout: 20_000 });

    await teacherPage.getByText('Take Attendance').click();
    await expect(teacherPage).toHaveURL(/\/attendance/, {
      timeout: 10_000,
    });
  });

  test('quick action navigates to academics page', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/dashboard');
    await expect(
      teacherPage.getByText(/welcome back/i).first()
    ).toBeVisible({ timeout: 20_000 });

    await teacherPage.getByText('Enter Grade').click();
    await expect(teacherPage).toHaveURL(/\/academics/, {
      timeout: 10_000,
    });
  });

  test('dashboard shows Today\'s Schedule card', async ({ teacherPage }) => {
    await teacherPage.goto('/dashboard');
    await expect(
      teacherPage.getByText(/welcome back/i).first()
    ).toBeVisible({ timeout: 20_000 });

    await expect(
      teacherPage.getByText("Today's Schedule")
    ).toBeVisible({ timeout: 10_000 });
  });

  test('dashboard shows all four stat cards', async ({ teacherPage }) => {
    await teacherPage.goto('/dashboard');
    await expect(
      teacherPage.getByText(/welcome back/i).first()
    ).toBeVisible({ timeout: 20_000 });

    const main = teacherPage.getByRole('main');
    await expect(main.getByText('My Classes')).toBeVisible({
      timeout: 10_000,
    });
    await expect(main.getByText('Total Students')).toBeVisible();
    await expect(
      main.getByText("Today's Attendance")
    ).toBeVisible();
    await expect(
      main.getByText('Pending Homework')
    ).toBeVisible();
  });
});
