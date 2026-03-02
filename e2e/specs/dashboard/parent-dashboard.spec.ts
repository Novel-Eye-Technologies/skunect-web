import { test, expect } from '../../fixtures/auth.fixture';
import { DashboardPage } from '../../pages/dashboard.page';

test.describe('Parent Dashboard', () => {
  test('parent sees children overview with greeting', async ({ parentPage }) => {
    const dashboard = new DashboardPage(parentPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
    await dashboard.expectParentDashboard();
  });
});
