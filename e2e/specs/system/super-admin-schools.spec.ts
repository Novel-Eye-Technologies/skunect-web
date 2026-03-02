import { test, expect } from '../../fixtures/auth.fixture';
import { SystemSchoolsPage } from '../../pages/system-schools.page';

test.describe('Super Admin - All Schools', () => {
  test('super admin can view all schools', async ({ superAdminPage }) => {
    const schools = new SystemSchoolsPage(superAdminPage);
    await schools.goto();
    await schools.expectVisible();
    await expect(schools.description).toBeVisible();
  });

  test('super admin sees schools in table', async ({ superAdminPage }) => {
    const schools = new SystemSchoolsPage(superAdminPage);
    await schools.goto();
    await schools.expectVisible();

    // Should show seeded schools
    await schools.expectSchoolInTable('Kings Academy');
    await schools.expectSchoolInTable('Greenfield');
  });
});
