import { test, expect } from '../../fixtures/auth.fixture';
import { SystemSeedPage } from '../../pages/system-seed.page';

test.describe('Super Admin - Seed Data', () => {
  test('super admin can view seed data page', async ({ superAdminPage }) => {
    const seed = new SystemSeedPage(superAdminPage);
    await seed.goto();
    await seed.expectVisible();
    await expect(seed.description).toBeVisible();
  });

  test('seed data page shows Test Accounts card', async ({
    superAdminPage,
  }) => {
    const seed = new SystemSeedPage(superAdminPage);
    await seed.goto();
    await seed.expectVisible();
    await seed.expectTestAccountsVisible();
  });

  test('reset button is visible', async ({ superAdminPage }) => {
    const seed = new SystemSeedPage(superAdminPage);
    await seed.goto();
    await seed.expectVisible();
    await expect(seed.resetButton).toBeVisible();
  });
});
