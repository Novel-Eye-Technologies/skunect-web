import { test, expect } from '../../fixtures/auth.fixture';
import { ProfilePage } from '../../pages/profile.page';

test.describe('User Profile', () => {
  test('admin can view their profile', async ({ adminPage }) => {
    const profile = new ProfilePage(adminPage);
    await profile.goto();
    await profile.expectVisible();
    await expect(profile.description).toBeVisible();
  });

  test('teacher can view their profile', async ({ teacherPage }) => {
    const profile = new ProfilePage(teacherPage);
    await profile.goto();
    await profile.expectVisible();
  });

  test('parent can view their profile', async ({ parentPage }) => {
    const profile = new ProfilePage(parentPage);
    await profile.goto();
    await profile.expectVisible();
  });
});
