import { test, expect } from '../../fixtures/auth.fixture';
import { DashboardPage } from '../../pages/dashboard.page';

test.describe('Super Admin Dashboard', () => {
  test('super admin sees platform-wide dashboard', async ({ superAdminPage }) => {
    const dashboard = new DashboardPage(superAdminPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
    await dashboard.expectSuperAdminDashboard();
  });

  test('super admin dashboard shows system stats', async ({ superAdminPage }) => {
    const dashboard = new DashboardPage(superAdminPage);
    await dashboard.goto();
    await dashboard.expectVisible();

    // Should show platform-wide metrics
    await expect(superAdminPage.getByText(/school|total/i).first()).toBeVisible();
  });
});
