import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Role-Based Access Control', () => {
  // ── Teacher blocked routes ──────────────────────────────────────────

  test('teacher cannot access school-settings', async ({ teacherPage }) => {
    await teacherPage.goto('/school-settings');
    // Should redirect to dashboard (access denied)
    await expect(teacherPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test('teacher cannot access user management', async ({ teacherPage }) => {
    await teacherPage.goto('/users');
    await expect(teacherPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test('teacher cannot access fee management', async ({ teacherPage }) => {
    await teacherPage.goto('/fees');
    await expect(teacherPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test('teacher cannot access data migration', async ({ teacherPage }) => {
    await teacherPage.goto('/data-migration');
    await expect(teacherPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  // ── Teacher allowed routes ──────────────────────────────────────────

  test('teacher can access attendance', async ({ teacherPage }) => {
    await teacherPage.goto('/attendance');
    await expect(teacherPage).toHaveURL(/\/attendance/, { timeout: 10_000 });
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  // ── Parent blocked routes ───────────────────────────────────────────

  test('parent cannot access school-settings', async ({ parentPage }) => {
    await parentPage.goto('/school-settings');
    await expect(parentPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test('parent cannot access user management', async ({ parentPage }) => {
    await parentPage.goto('/users');
    await expect(parentPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test('parent can access attendance page (not admin-only)', async ({ parentPage }) => {
    // /attendance is NOT in ADMIN_ONLY_ROUTES, so parents can access it
    await parentPage.goto('/attendance');
    await expect(parentPage).toHaveURL(/\/attendance/, { timeout: 10_000 });
  });

  test('parent cannot access data migration', async ({ parentPage }) => {
    await parentPage.goto('/data-migration');
    await expect(parentPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  // ── Parent allowed routes ───────────────────────────────────────────

  test('parent cannot access fees (admin-only route)', async ({ parentPage }) => {
    // /fees is in ADMIN_ONLY_ROUTES, so parents get redirected to /dashboard
    await parentPage.goto('/fees');
    await expect(parentPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  // ── Super-admin routes ──────────────────────────────────────────────

  test('non-super-admin cannot access system schools', async ({ adminPage }) => {
    await adminPage.goto('/system/schools');
    await expect(adminPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test('non-super-admin cannot access seed data', async ({ adminPage }) => {
    await adminPage.goto('/system/seed');
    await expect(adminPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test('super admin can access system schools', async ({ superAdminPage }) => {
    await superAdminPage.goto('/system/schools');
    await expect(superAdminPage).toHaveURL(/\/system\/schools/);
    await expect(
      superAdminPage.getByRole('heading', { name: /all schools/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('super admin can access seed data', async ({ superAdminPage }) => {
    await superAdminPage.goto('/system/seed');
    await expect(superAdminPage).toHaveURL(/\/system\/seed/);
    await expect(
      superAdminPage.getByRole('heading', { name: /seed data/i })
    ).toBeVisible({ timeout: 20_000 });
  });
});
