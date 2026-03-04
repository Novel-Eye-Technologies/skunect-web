import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Deep Linking', () => {
  test('unauthenticated user visiting /dashboard redirects to /login', async ({
    page,
  }) => {
    // Use a clean page (no storageState)
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\/?/, { timeout: 10_000 });
  });

  test('unauthenticated user visiting /students redirects to /login', async ({
    page,
  }) => {
    await page.goto('/students');
    await expect(page).toHaveURL(/\/login\/?/, { timeout: 10_000 });
  });

  test('authenticated admin can deep-link to /students', async ({
    adminPage,
  }) => {
    await adminPage.goto('/students');
    await expect(adminPage).toHaveURL(/\/students\/?/);
    await expect(
      adminPage.getByRole('heading', { name: /students/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('authenticated admin can deep-link to /homework', async ({
    adminPage,
  }) => {
    await adminPage.goto('/homework');
    await expect(adminPage).toHaveURL(/\/homework\/?/);
    await expect(
      adminPage.getByRole('heading', { name: /homework/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('authenticated admin can deep-link to /attendance', async ({
    adminPage,
  }) => {
    await adminPage.goto('/attendance');
    await expect(adminPage).toHaveURL(/\/attendance\/?/);
    await expect(
      adminPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('authenticated teacher can deep-link to /attendance', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/attendance');
    await expect(teacherPage).toHaveURL(/\/attendance\/?/);
    await expect(
      teacherPage.getByRole('heading', { name: /attendance/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('authenticated parent can deep-link to /homework', async ({
    parentPage,
  }) => {
    await parentPage.goto('/homework');
    await expect(parentPage).toHaveURL(/\/homework\/?/);
    await expect(
      parentPage.getByRole('heading', { name: /homework/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('authenticated parent visiting /fees is redirected (admin-only route)', async ({
    parentPage,
  }) => {
    // /fees is in ADMIN_ONLY_ROUTES, so parent gets redirected to /dashboard
    await parentPage.goto('/fees');
    await expect(parentPage).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });
  });
});
