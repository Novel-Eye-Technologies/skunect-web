import fs from 'fs';
import path from 'path';
import { test, expect } from '../../fixtures/auth.fixture';
import { SchoolDetailPage } from '../../pages/school-detail.page';
import { apiGet, apiDelete } from '../../helpers/api.helper';

// School detail is a dynamic route ([schoolId]) that requires CloudFront fallback
// or local dev server. Static export only pre-renders /system/schools/_/.
// Skip these tests when running against the deployed static site.
const isLocalDev = (process.env.E2E_BASE_URL ?? '').includes('localhost');

// Sequential because admin CRUD tests depend on each other
test.describe.serial('School Detail Page (Super Admin)', () => {
  let schoolId: string;
  let token: string;
  const adminEmail = `e2e-school-admin-${Date.now()}@test.skunect.com`;

  test.beforeAll(async () => {
    if (!isLocalDev) return;
    try {
      const authFile = path.resolve(process.cwd(), '.auth/super-admin.json');
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      const zustand = JSON.parse(authData.origins[0].localStorage[0].value);
      token = zustand.state.accessToken as string;

      const res = await apiGet<Array<{ id: string; name: string }>>(
        '/admin/schools',
        token
      );
      const kingsAcademy = (res.data ?? []).find((s) =>
        s.name.includes('Kings Academy')
      );
      if (kingsAcademy) {
        schoolId = kingsAcademy.id;
      }

      if (schoolId) {
        const adminsRes = await apiGet<
          Array<{ id: string; email: string; firstName: string }>
        >(`/admin/schools/${schoolId}/admins`, token);
        const stale = (adminsRes.data ?? []).filter(
          (a) => a.firstName === 'E2E' || a.email.includes('e2e-school-admin-')
        );
        for (const a of stale) {
          await apiDelete(
            `/admin/schools/${schoolId}/admins/${a.id}`,
            token
          ).catch(() => {});
        }
      }
    } catch {
      // best-effort
    }
  });

  test('super admin can view school detail page', async ({
    superAdminPage,
  }) => {
    test.skip(!isLocalDev, 'School detail requires local dev (dynamic route)');
    test.skip(!schoolId, 'No school ID found for test');
    const detail = new SchoolDetailPage(superAdminPage);
    await detail.goto(schoolId);
    await detail.expectVisible('Kings Academy');
  });

  test('school detail shows info and metrics', async ({ superAdminPage }) => {
    test.skip(!isLocalDev, 'School detail requires local dev (dynamic route)');
    test.skip(!schoolId, 'No school ID found for test');
    const detail = new SchoolDetailPage(superAdminPage);
    await detail.goto(schoolId);
    await detail.expectVisible('Kings Academy');
    await detail.expectSchoolInfo();
    await detail.expectAdminSection();
    await detail.expectMetricCards();
  });

  test('super admin can navigate back to all schools', async ({
    superAdminPage,
  }) => {
    test.skip(!isLocalDev, 'School detail requires local dev (dynamic route)');
    test.skip(!schoolId, 'No school ID found for test');
    const detail = new SchoolDetailPage(superAdminPage);
    await detail.goto(schoolId);
    await detail.expectVisible('Kings Academy');
    await detail.backButton.click();
    await expect(
      superAdminPage.getByRole('heading', { name: 'All Schools' })
    ).toBeVisible({ timeout: 15_000 });
  });

  test('super admin can create a school admin', async ({
    superAdminPage,
  }) => {
    test.skip(!isLocalDev, 'School detail requires local dev (dynamic route)');
    test.skip(!schoolId, 'No school ID found for test');
    const detail = new SchoolDetailPage(superAdminPage);
    await detail.goto(schoolId);
    await detail.expectVisible('Kings Academy');

    await detail.clickAddAdmin();
    await detail.fillCreateAdminForm('E2E', 'Admin', adminEmail);
    await detail.submitCreate();

    await expect(detail.dialog).not.toBeVisible({ timeout: 10_000 });
    await detail.expectAdminInTable(adminEmail);
  });

  test('super admin can edit a school admin', async ({ superAdminPage }) => {
    test.skip(!isLocalDev, 'School detail requires local dev (dynamic route)');
    test.skip(!schoolId, 'No school ID found for test');
    const detail = new SchoolDetailPage(superAdminPage);
    await detail.goto(schoolId);
    await detail.expectVisible('Kings Academy');

    await detail.clickEditAdmin(adminEmail);
    await detail.fillEditAdminForm('E2E Edited', 'AdminName');
    await detail.submitEdit();

    await expect(detail.dialog).not.toBeVisible({ timeout: 10_000 });
    await detail.expectAdminInTable('E2E Edited');
  });

  test('super admin can deactivate and activate a school admin', async ({
    superAdminPage,
  }) => {
    test.skip(!isLocalDev, 'School detail requires local dev (dynamic route)');
    test.skip(!schoolId, 'No school ID found for test');
    const detail = new SchoolDetailPage(superAdminPage);
    await detail.goto(schoolId);
    await detail.expectVisible('Kings Academy');

    await detail.clickDeactivateAdmin(adminEmail);
    await detail.confirmAlert(/deactivate/i);
    await superAdminPage.waitForTimeout(1_000);
    await detail.clickActivateAdmin(adminEmail);
    await detail.confirmAlert(/activate/i);
  });

  test('super admin can remove a school admin role', async ({
    superAdminPage,
  }) => {
    test.skip(!isLocalDev, 'School detail requires local dev (dynamic route)');
    test.skip(!schoolId, 'No school ID found for test');
    const detail = new SchoolDetailPage(superAdminPage);
    await detail.goto(schoolId);
    await detail.expectVisible('Kings Academy');

    await detail.clickDeleteAdmin(adminEmail);
    await detail.confirmAlert(/remove/i);
    await detail.expectAdminNotInTable(adminEmail);
  });
});
