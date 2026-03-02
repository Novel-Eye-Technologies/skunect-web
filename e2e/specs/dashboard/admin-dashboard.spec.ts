import { test, expect } from '../../fixtures/auth.fixture';
import { DashboardPage } from '../../pages/dashboard.page';

test.describe('Admin Dashboard', () => {
  test('admin sees school dashboard with greeting', async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
    await dashboard.expectAdminDashboard();
  });

  test('admin dashboard displays stat cards', async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectVisible();

    // Admin should see school-related stats
    await expect(adminPage.getByText(/student|teacher|class/i).first()).toBeVisible();
  });
});
