import { test, expect } from '../../fixtures/auth.fixture';
import { DashboardPage } from '../../pages/dashboard.page';

test.describe('Teacher Dashboard', () => {
  test('teacher sees school dashboard with greeting', async ({ teacherPage }) => {
    const dashboard = new DashboardPage(teacherPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
    await dashboard.expectTeacherDashboard();
  });
});
