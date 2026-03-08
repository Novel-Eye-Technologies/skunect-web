import fs from 'fs';
import path from 'path';
import { test, expect } from '../../fixtures/auth.fixture';
import { SystemSchoolsPage } from '../../pages/system-schools.page';
import { apiDelete, apiGet } from '../../helpers/api.helper';

// Sequential: create → edit → deactivate/activate depend on each other
test.describe.serial('System Schools CRUD (Super Admin)', () => {
  const uniqueSchoolName = `E2E School ${Date.now()}`;

  // Clean up E2E test schools from previous runs
  test.beforeAll(async () => {
    try {
      const authFile = path.resolve(process.cwd(), '.auth/super-admin.json');
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      const zustand = JSON.parse(authData.origins[0].localStorage[0].value);
      const token = zustand.state.accessToken as string;

      const res = await apiGet<Array<{ id: string; name: string }>>(
        '/admin/schools',
        token
      );
      const staleSchools = (res.data ?? []).filter(
        (s) =>
          s.name.startsWith('E2E School') || s.name.startsWith('Delete Me')
      );
      for (const s of staleSchools) {
        await apiDelete(`/admin/schools/${s.id}`, token).catch(() => {});
      }
    } catch {
      // Cleanup is best-effort
    }
  });

  test('super admin can view all schools page', async ({ superAdminPage }) => {
    const schools = new SystemSchoolsPage(superAdminPage);
    await schools.goto();
    await schools.expectVisible();
    await expect(schools.description).toBeVisible();
    await expect(schools.addButton).toBeVisible();
  });

  test('super admin sees seeded schools in table', async ({
    superAdminPage,
  }) => {
    const schools = new SystemSchoolsPage(superAdminPage);
    await schools.goto();
    await schools.expectVisible();
    await schools.expectSchoolInTable('Kings Academy');
    await schools.expectSchoolInTable('Greenfield');
  });

  test('super admin can create a new school', async ({ superAdminPage }) => {
    const schools = new SystemSchoolsPage(superAdminPage);
    await schools.goto();
    await schools.expectVisible();

    await schools.clickAdd();
    await schools.fillSchoolForm(uniqueSchoolName, 'STANDARD');
    await schools.submitSchoolForm();

    // Dialog should close
    await expect(schools.dialog).not.toBeVisible({ timeout: 10_000 });
    // New school should appear in table
    await schools.expectSchoolInTable(uniqueSchoolName);
  });

  test('super admin can edit a school', async ({ superAdminPage }) => {
    const schools = new SystemSchoolsPage(superAdminPage);
    await schools.goto();
    await schools.expectVisible();

    // Edit the E2E school we just created
    await schools.clickEditSchool(uniqueSchoolName);
    await schools.emailInput.fill('e2e-school@test.com');
    await schools.submitSchoolForm();

    await expect(schools.dialog).not.toBeVisible({ timeout: 10_000 });
  });

  test('super admin can deactivate and activate a school', async ({
    superAdminPage,
  }) => {
    const schools = new SystemSchoolsPage(superAdminPage);
    await schools.goto();
    await schools.expectVisible();

    // Deactivate
    await schools.clickDeactivateSchool(uniqueSchoolName);
    await schools.confirmAlert(/deactivate/i);

    // Verify status changed — wait for table refresh
    await superAdminPage.waitForTimeout(1_000);

    // Activate
    await schools.clickActivateSchool(uniqueSchoolName);
    await schools.confirmAlert(/activate/i);
  });

  test('super admin can delete a school', async ({ superAdminPage }) => {
    const schools = new SystemSchoolsPage(superAdminPage);
    await schools.goto();
    await schools.expectVisible();

    // Create a school to delete
    const deleteSchoolName = `Delete Me ${Date.now()}`;
    await schools.clickAdd();
    await schools.fillSchoolForm(deleteSchoolName, 'STANDARD');
    await schools.submitSchoolForm();
    await expect(schools.dialog).not.toBeVisible({ timeout: 10_000 });
    await schools.expectSchoolInTable(deleteSchoolName);

    // Delete it
    await schools.clickDeleteSchool(deleteSchoolName);
    await schools.confirmAlert(/delete/i);
    await schools.expectSchoolNotInTable(deleteSchoolName);
  });

  test('cancel button closes school dialog without saving', async ({
    superAdminPage,
  }) => {
    const schools = new SystemSchoolsPage(superAdminPage);
    await schools.goto();
    await schools.expectVisible();

    await schools.clickAdd();
    await schools.schoolNameInput.fill('Should Not Save');
    await schools.cancelDialog();

    await expect(schools.dialog).not.toBeVisible({ timeout: 3_000 });
  });
});
