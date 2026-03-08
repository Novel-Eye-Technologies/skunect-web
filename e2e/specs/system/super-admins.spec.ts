import fs from 'fs';
import path from 'path';
import { test, expect } from '../../fixtures/auth.fixture';
import { SuperAdminsPage } from '../../pages/super-admins.page';
import { apiGet, apiDelete } from '../../helpers/api.helper';

// Sequential: create → edit → deactivate/activate → delete depend on each other
test.describe.serial('Super Admins Management (CRUD)', () => {
  const uniqueEmail = `e2e-sa-${Date.now()}@test.skunect.com`;
  const firstName = 'E2E';
  const lastName = 'SuperAdmin';

  // Clean up E2E test super admins from previous runs
  test.beforeAll(async () => {
    try {
      const authFile = path.resolve(process.cwd(), '.auth/super-admin.json');
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      const zustand = JSON.parse(authData.origins[0].localStorage[0].value);
      const token = zustand.state.accessToken as string;

      const res = await apiGet<
        Array<{ id: string; firstName: string; email: string }>
      >('/admin/super-admins', token);
      const stale = (res.data ?? []).filter(
        (a) => a.firstName === 'E2E' || a.email.includes('e2e-sa-')
      );
      for (const a of stale) {
        await apiDelete(`/admin/super-admins/${a.id}`, token).catch(() => {});
      }
    } catch {
      // best-effort cleanup
    }
  });

  test('super admin can view super admins page', async ({
    superAdminPage,
  }) => {
    const page = new SuperAdminsPage(superAdminPage);
    await page.goto();
    await page.expectVisible();
    await expect(page.description).toBeVisible();
    await expect(page.addButton).toBeVisible();
  });

  test('super admin sees existing admins in table', async ({
    superAdminPage,
  }) => {
    const page = new SuperAdminsPage(superAdminPage);
    await page.goto();
    await page.expectVisible();
    await page.expectTableNotEmpty();
    // The logged-in super admin should appear
    await page.expectAdminInTable('superadmin@skunect.com');
  });

  test('super admin can create a new super admin', async ({
    superAdminPage,
  }) => {
    const page = new SuperAdminsPage(superAdminPage);
    await page.goto();
    await page.expectVisible();

    await page.clickAdd();
    await page.fillCreateForm(firstName, lastName, uniqueEmail);
    await page.submitCreate();

    await expect(page.dialog).not.toBeVisible({ timeout: 10_000 });
    await page.expectAdminInTable(uniqueEmail);
  });

  test('super admin can edit a super admin name', async ({
    superAdminPage,
  }) => {
    const page = new SuperAdminsPage(superAdminPage);
    await page.goto();
    await page.expectVisible();

    await page.clickEditOnRow(uniqueEmail);
    await page.fillEditForm('E2E Updated', 'AdminName');
    await page.submitEdit();

    await expect(page.dialog).not.toBeVisible({ timeout: 10_000 });
    await page.expectAdminInTable('E2E Updated');
  });

  test('super admin can deactivate and activate a super admin', async ({
    superAdminPage,
  }) => {
    const page = new SuperAdminsPage(superAdminPage);
    await page.goto();
    await page.expectVisible();

    // Deactivate
    await page.clickDeactivateOnRow(uniqueEmail);
    await page.confirmAlert(/deactivate/i);

    await superAdminPage.waitForTimeout(1_000);

    // Activate
    await page.clickActivateOnRow(uniqueEmail);
    await page.confirmAlert(/activate/i);
  });

  test('super admin can remove a super admin role', async ({
    superAdminPage,
  }) => {
    const page = new SuperAdminsPage(superAdminPage);
    await page.goto();
    await page.expectVisible();

    await page.clickDeleteOnRow(uniqueEmail);
    await page.confirmAlert(/remove role/i);
    await page.expectAdminNotInTable(uniqueEmail);
  });

  test('cancel button closes dialog without saving', async ({
    superAdminPage,
  }) => {
    const page = new SuperAdminsPage(superAdminPage);
    await page.goto();
    await page.expectVisible();

    await page.clickAdd();
    await page.fillCreateForm('NoSave', 'Test', 'nosave@test.com');
    await page.cancelDialog();

    await expect(page.dialog).not.toBeVisible({ timeout: 3_000 });
  });
});
