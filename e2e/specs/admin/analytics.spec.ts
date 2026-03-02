import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Analytics Dashboard', () => {
  test('admin can view analytics page', async ({ adminPage }) => {
    await adminPage.goto('/analytics');
    await expect(
      adminPage.getByRole('heading', { name: /analytics/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('analytics page shows all four tabs', async ({ adminPage }) => {
    await adminPage.goto('/analytics');
    await expect(
      adminPage.getByRole('heading', { name: /analytics/i })
    ).toBeVisible({ timeout: 20_000 });

    await expect(
      adminPage.getByRole('tab', { name: /overview/i })
    ).toBeVisible();
    await expect(
      adminPage.getByRole('tab', { name: /attendance/i })
    ).toBeVisible();
    await expect(
      adminPage.getByRole('tab', { name: /academic/i })
    ).toBeVisible();
    await expect(
      adminPage.getByRole('tab', { name: /fees/i })
    ).toBeVisible();
  });

  test('overview tab shows stat cards', async ({ adminPage }) => {
    await adminPage.goto('/analytics');
    await expect(
      adminPage.getByRole('heading', { name: /analytics/i })
    ).toBeVisible({ timeout: 20_000 });

    // Overview tab should be active by default
    // Should see stat cards for Total Students, Teachers, Attendance Rate, Fees
    await expect(
      adminPage.getByText('Total Students')
    ).toBeVisible({ timeout: 10_000 });
    await expect(adminPage.getByText('Total Teachers')).toBeVisible();
    await expect(adminPage.getByText('Attendance Rate')).toBeVisible();
    await expect(adminPage.getByText('Fees Collected')).toBeVisible();
  });

  test('attendance analytics tab shows filters and charts', async ({
    adminPage,
  }) => {
    await adminPage.goto('/analytics');
    await expect(
      adminPage.getByRole('heading', { name: /analytics/i })
    ).toBeVisible({ timeout: 20_000 });

    // Click Attendance tab
    await adminPage.getByRole('tab', { name: /attendance/i }).click();

    // Should see date filters and class filter
    await expect(
      adminPage.locator('input[type="date"]').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('academic analytics tab shows filters', async ({ adminPage }) => {
    await adminPage.goto('/analytics');
    await expect(
      adminPage.getByRole('heading', { name: /analytics/i })
    ).toBeVisible({ timeout: 20_000 });

    // Click Academic tab
    await adminPage.getByRole('tab', { name: /academic/i }).click();

    // Should see term and class filters
    await expect(adminPage.getByRole('combobox').first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('fees analytics tab shows collection data', async ({ adminPage }) => {
    await adminPage.goto('/analytics');
    await expect(
      adminPage.getByRole('heading', { name: /analytics/i })
    ).toBeVisible({ timeout: 20_000 });

    // Click Fees tab
    await adminPage.getByRole('tab', { name: /fees/i }).click();

    // Should see collection metrics — use .first() since multiple cards match
    await expect(
      adminPage.getByText('Collection Rate')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('teacher can also view analytics page', async ({ teacherPage }) => {
    await teacherPage.goto('/analytics');

    // Teachers have read access to analytics
    await expect(
      teacherPage.getByRole('heading', { name: /analytics/i })
    ).toBeVisible({ timeout: 20_000 });
  });
});
