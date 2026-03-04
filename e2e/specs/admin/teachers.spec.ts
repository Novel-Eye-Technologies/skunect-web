import { test, expect } from '../../fixtures/auth.fixture';
import { TeachersPage } from '../../pages/teachers.page';

test.describe('Teachers Management', () => {
  test('admin can view teachers page', async ({ adminPage }) => {
    const teachers = new TeachersPage(adminPage);
    await teachers.goto();
    await teachers.expectVisible();
    await expect(teachers.description).toBeVisible();
  });

  test('teachers page shows data table', async ({ adminPage }) => {
    const teachers = new TeachersPage(adminPage);
    await teachers.goto();
    await teachers.expectVisible();
    await expect(adminPage.locator('table')).toBeVisible({ timeout: 10_000 });
  });

  test('admin sees Invite Teacher button', async ({ adminPage }) => {
    const teachers = new TeachersPage(adminPage);
    await teachers.goto();
    await teachers.expectVisible();
    await expect(teachers.inviteTeacherButton).toBeVisible();
  });
});
