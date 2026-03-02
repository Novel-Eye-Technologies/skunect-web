import { test, expect } from '../../fixtures/auth.fixture';
import { SidebarPage } from '../../pages/sidebar.page';

test.describe('Logout', () => {
  test('admin can logout and is redirected to login', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');

    // Wait for the dashboard to fully load (auth validated, sidebar rendered)
    await expect(adminPage.locator('h1')).toBeVisible({ timeout: 20_000 });

    const sidebar = new SidebarPage(adminPage);
    await sidebar.logout();

    // Should redirect to login
    await expect(adminPage).toHaveURL(/\/login/, { timeout: 15_000 });
  });

  test('after logout, accessing protected route redirects to login', async ({
    adminPage,
  }) => {
    await adminPage.goto('/dashboard');
    await expect(adminPage.locator('h1')).toBeVisible({ timeout: 20_000 });

    const sidebar = new SidebarPage(adminPage);
    await sidebar.logout();

    await expect(adminPage).toHaveURL(/\/login/, { timeout: 15_000 });

    // Try to access a protected route directly
    await adminPage.goto('/students');

    // Should be redirected back to login
    await expect(adminPage).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
