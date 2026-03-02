import { test, expect } from '../../fixtures/auth.fixture';
import { UsersPage } from '../../pages/users.page';

test.describe('User Management', () => {
  test('admin can view user management page', async ({ adminPage }) => {
    const users = new UsersPage(adminPage);
    await users.goto();
    await users.expectVisible();
  });

  test('admin sees Invite User button', async ({ adminPage }) => {
    const users = new UsersPage(adminPage);
    await users.goto();
    await users.expectVisible();
    await expect(users.inviteButton).toBeVisible();
  });
});
