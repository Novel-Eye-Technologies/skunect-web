import { test, expect } from '../../fixtures/auth.fixture';
import { ParentsPage } from '../../pages/parents.page';

test.describe('Parents Management', () => {
  test('admin can view parents page', async ({ adminPage }) => {
    const parents = new ParentsPage(adminPage);
    await parents.goto();
    await parents.expectVisible();
    await expect(parents.description).toBeVisible();
  });

  test('parents page shows data table', async ({ adminPage }) => {
    const parents = new ParentsPage(adminPage);
    await parents.goto();
    await parents.expectVisible();
    // Should have a table rendered
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 10_000 });
  });
});
