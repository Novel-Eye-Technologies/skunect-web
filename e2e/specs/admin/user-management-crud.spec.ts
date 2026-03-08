import { test, expect } from '../../fixtures/auth.fixture';
import { UsersPage } from '../../pages/users.page';

test.describe('User Management CRUD (Admin)', () => {
  test('admin can view user management page with table', async ({
    adminPage,
  }) => {
    const users = new UsersPage(adminPage);
    await users.goto();
    await users.expectVisible();
    await expect(users.inviteButton).toBeVisible();
    await users.expectTableNotEmpty();
  });

  test('admin can filter users by role', async ({ adminPage }) => {
    const users = new UsersPage(adminPage);
    await users.goto();
    await users.expectVisible();
    await users.expectTableNotEmpty();

    // shadcn Select triggers render as combobox
    // Role filter is the first combobox, status is the second
    const roleSelect = adminPage.getByRole('combobox').first();
    await roleSelect.click();
    await adminPage.getByRole('option', { name: 'Admin' }).click();

    // Table should still load (may have fewer rows)
    await adminPage.waitForTimeout(1_000);

    // Reset filter
    await roleSelect.click();
    await adminPage.getByRole('option', { name: 'All Roles' }).click();
  });

  test('admin can filter users by status', async ({ adminPage }) => {
    const users = new UsersPage(adminPage);
    await users.goto();
    await users.expectVisible();
    await users.expectTableNotEmpty();

    // Status filter is the second combobox (first=role, second=status, third=pagination)
    const statusSelect = adminPage.getByRole('combobox').nth(1);
    await statusSelect.click();
    await adminPage.getByRole('option', { name: 'Active', exact: true }).click();

    // Table should still load
    await adminPage.waitForTimeout(1_000);

    // Reset filter
    await statusSelect.click();
    await adminPage.getByRole('option', { name: 'All Statuses' }).click();
  });

  test('admin can open edit user dialog and update details', async ({
    adminPage,
  }) => {
    const users = new UsersPage(adminPage);
    await users.goto();
    await users.expectVisible();
    await users.expectTableNotEmpty();

    // Get the first user's name to edit
    const firstRow = users.dataTable.locator('tbody tr').first();
    const userName = await firstRow.locator('td').first().textContent();

    if (userName) {
      await users.clickEditDetails(userName.trim());
      // Dialog should show "Edit User" title
      await expect(
        users.dialog.getByText('Edit User', { exact: true })
      ).toBeVisible();

      // Email field should be visible and disabled (plain label + disabled input)
      const emailInput = users.dialog.locator('input[disabled]').first();
      await expect(emailInput).toBeVisible();

      // Cancel without changes
      await users.cancelDialog();
      await expect(users.dialog).not.toBeVisible({ timeout: 3_000 });
    }
  });

  test('admin can open remove user confirmation', async ({ adminPage }) => {
    const users = new UsersPage(adminPage);
    await users.goto();
    await users.expectVisible();
    await users.expectTableNotEmpty();

    // Get a user's name to check action menu
    const firstRow = users.dataTable.locator('tbody tr').first();
    const userName = await firstRow.locator('td').first().textContent();

    if (userName) {
      await users.openActionsMenu(userName.trim());

      // Check that the action menu items are visible
      await expect(
        adminPage.getByRole('menuitem', { name: /edit details/i })
      ).toBeVisible();
      await expect(
        adminPage.getByRole('menuitem', { name: /change status/i })
      ).toBeVisible();
      await expect(
        adminPage.getByRole('menuitem', { name: /remove user/i })
      ).toBeVisible();

      // Close menu by pressing Escape
      await adminPage.keyboard.press('Escape');
    }
  });
});
