import { test, expect } from '../../fixtures/auth.fixture';
import { DataMigrationPage } from '../../pages/data-migration.page';

test.describe('Data Migration', () => {
  test('admin can view data migration page', async ({ adminPage }) => {
    const migration = new DataMigrationPage(adminPage);
    await migration.goto();
    await migration.expectVisible();
    await expect(migration.description).toBeVisible();
  });

  test('data migration shows upload and history tabs', async ({
    adminPage,
  }) => {
    const migration = new DataMigrationPage(adminPage);
    await migration.goto();
    await migration.expectVisible();
    await expect(migration.uploadTab).toBeVisible();
    await expect(migration.historyTab).toBeVisible();
  });

  test('teacher cannot access data migration', async ({ teacherPage }) => {
    await teacherPage.goto('/data-migration');
    // Teacher should see "Access Denied" message
    await expect(
      teacherPage.getByText('Access Denied')
    ).toBeVisible({ timeout: 15_000 });
  });
});
