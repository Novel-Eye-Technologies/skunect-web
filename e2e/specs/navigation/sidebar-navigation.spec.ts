import { test, expect } from '../../fixtures/auth.fixture';
import { SidebarPage } from '../../pages/sidebar.page';
import { TEST_ACCOUNTS } from '../../fixtures/test-accounts';

test.describe('Sidebar Navigation', () => {
  test('admin sees correct nav items', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    // Wait for the dashboard h1 to appear (auth validation complete)
    await expect(adminPage.locator('h1')).toBeVisible({ timeout: 20_000 });

    const sidebar = new SidebarPage(adminPage);
    await sidebar.expectNavItems(TEST_ACCOUNTS.adminKings.expectedNavItems);
  });

  test('teacher sees correct nav items', async ({ teacherPage }) => {
    await teacherPage.goto('/dashboard');
    await expect(teacherPage.locator('h1')).toBeVisible({ timeout: 20_000 });

    const sidebar = new SidebarPage(teacherPage);
    await sidebar.expectNavItems(TEST_ACCOUNTS.teacherKings.expectedNavItems);
  });

  test('parent sees correct nav items', async ({ parentPage }) => {
    await parentPage.goto('/dashboard');
    await expect(parentPage.locator('h1')).toBeVisible({ timeout: 20_000 });

    const sidebar = new SidebarPage(parentPage);
    await sidebar.expectNavItems(TEST_ACCOUNTS.parentSingle.expectedNavItems);
  });

  test('super admin sees correct nav items', async ({ superAdminPage }) => {
    await superAdminPage.goto('/dashboard');
    await expect(superAdminPage.locator('h1')).toBeVisible({ timeout: 20_000 });

    const sidebar = new SidebarPage(superAdminPage);
    await sidebar.expectNavItems(TEST_ACCOUNTS.superAdmin.expectedNavItems);
  });

  test('admin can navigate to Students via sidebar', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await expect(adminPage.locator('h1')).toBeVisible({ timeout: 20_000 });

    const sidebar = new SidebarPage(adminPage);
    await sidebar.navigateTo('Students');
    await expect(adminPage).toHaveURL(/\/students\/?/, { timeout: 10_000 });
  });

  test('admin can navigate to Homework via sidebar', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await expect(adminPage.locator('h1')).toBeVisible({ timeout: 20_000 });

    const sidebar = new SidebarPage(adminPage);
    await sidebar.navigateTo('Homework');
    await expect(adminPage).toHaveURL(/\/homework\/?/, { timeout: 10_000 });
  });
});
