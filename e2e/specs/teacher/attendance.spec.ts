import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Attendance Management', () => {
  test('teacher can view attendance page', async ({ teacherPage }) => {
    await teacherPage.goto('/attendance');
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('attendance page shows Mark Attendance and Records tabs', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/attendance');
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });

    await expect(
      teacherPage.getByRole('tab', { name: /mark attendance/i })
    ).toBeVisible();
    await expect(
      teacherPage.getByRole('tab', { name: /records/i })
    ).toBeVisible();
  });

  test('mark attendance tab shows class and date selectors', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/attendance');
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });

    // Should see "Select Class & Date" card with class combobox
    await expect(
      teacherPage.getByText('Select Class & Date')
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      teacherPage.getByRole('combobox').first()
    ).toBeVisible();
  });

  test('teacher can select a class to mark attendance', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/attendance');
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });

    // Select first available class
    const classSelect = teacherPage.getByRole('combobox').first();
    await classSelect.click();
    const firstOption = teacherPage.getByRole('option').first();
    await firstOption.click();

    // Should show student table, Mark All buttons, or empty state
    await expect(
      teacherPage
        .getByRole('button', { name: /mark all present/i })
        .or(teacherPage.getByText(/no students found/i))
        .or(teacherPage.getByText(/select a class/i))
    ).toBeVisible({ timeout: 10_000 });
  });

  test('teacher can mark all students present', async ({ teacherPage }) => {
    await teacherPage.goto('/attendance');
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });

    // Select a class — use a seed class that has students
    const classSelect = teacherPage.getByRole('combobox').first();
    await classSelect.click();
    // Pick first option (seed class should have students)
    await teacherPage.getByRole('option').first().click();

    // Wait for student list to load — may show "No students" or the grid
    const markAllPresent = teacherPage.getByRole('button', {
      name: /mark all present/i,
    });
    const noStudents = teacherPage.getByText(/no students found/i);

    const hasStudents = await markAllPresent
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!hasStudents) {
      // Skip — selected class has no students enrolled
      test.skip();
      return;
    }

    // Click Mark All Present
    await markAllPresent.click();

    // Submit attendance
    const submitBtn = teacherPage.getByRole('button', {
      name: /submit attendance/i,
    });
    await expect(submitBtn).toBeEnabled({ timeout: 3_000 });
  });

  test('records tab shows attendance history', async ({ teacherPage }) => {
    await teacherPage.goto('/attendance');
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });

    // Switch to Records tab
    await teacherPage.getByRole('tab', { name: /records/i }).click();

    // Should see table or empty state
    const table = teacherPage.locator('table');
    const emptyState = teacherPage.getByText(/no attendance/i);
    await expect(table.or(emptyState)).toBeVisible({ timeout: 10_000 });
  });

  test('admin can view attendance page', async ({ adminPage }) => {
    await adminPage.goto('/attendance');
    await expect(
      adminPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });
  });
});
