import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Attendance Management', () => {
  test('teacher can view attendance page', async ({ teacherPage }) => {
    await teacherPage.goto('/attendance');
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('daily overview is visible at the top of the page', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/attendance');
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });

    // Daily overview stats should be visible above tabs
    await expect(
      teacherPage.getByText('Total Students').first()
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      teacherPage.getByText('Present').first()
    ).toBeVisible();
    await expect(
      teacherPage.getByText('Absent').first()
    ).toBeVisible();
    await expect(
      teacherPage.getByText('Late').first()
    ).toBeVisible();
  });

  test('class and date filters are visible below overview', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/attendance');
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });

    // Class filter dropdown
    await expect(
      teacherPage.getByRole('combobox').first()
    ).toBeVisible({ timeout: 10_000 });

    // Date filter input
    await expect(
      teacherPage.locator('input[type="date"]').first()
    ).toBeVisible();
  });

  test('attendance page shows only Mark Attendance and Records tabs', async ({
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

    // Overview tab should NOT exist
    const overviewTab = teacherPage.getByRole('tab', {
      name: /overview/i,
    });
    await expect(overviewTab).not.toBeVisible();
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
  });

  test('teacher can select a class to mark attendance', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/attendance');
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });

    // The AttendanceGrid has its own class selector inside the "Select Class & Date" card
    // Wait for it to be visible
    await expect(
      teacherPage.getByText('Select Class & Date')
    ).toBeVisible({ timeout: 10_000 });

    // Select first available class from the grid's combobox
    const classSelects = teacherPage.getByRole('combobox');
    // The grid's class selector may be the second combobox (first is the filter)
    const gridClassSelect = classSelects.last();
    await gridClassSelect.click();
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

    // Select a class
    await expect(
      teacherPage.getByText('Select Class & Date')
    ).toBeVisible({ timeout: 10_000 });

    const classSelects = teacherPage.getByRole('combobox');
    const gridClassSelect = classSelects.last();
    await gridClassSelect.click();
    await teacherPage.getByRole('option').first().click();

    // Wait for student list to load
    const markAllPresent = teacherPage.getByRole('button', {
      name: /mark all present/i,
    });

    const hasStudents = await markAllPresent
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!hasStudents) {
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

  test('daily overview stats are rendered above the tabs', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/attendance');
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });

    // The daily overview stat cards should appear above the tabs
    // They are always rendered (even when values are 0)
    await expect(
      teacherPage.getByText('Total Students').first()
    ).toBeVisible({ timeout: 10_000 });

    // Tabs should appear below
    await expect(
      teacherPage.getByRole('tab', { name: /mark attendance/i })
    ).toBeVisible();
  });
});
