import { test, expect } from '../../fixtures/auth.fixture';
import { NotificationPreferencesPage } from '../../pages/notification-preferences.page';

test.describe('Notification Preferences', () => {
  test('admin can view notification preferences page', async ({
    adminPage,
  }) => {
    const prefs = new NotificationPreferencesPage(adminPage);
    await prefs.goto();
    await prefs.expectVisible();
    await expect(prefs.description).toBeVisible();
  });

  test('notification preferences shows channels card', async ({
    adminPage,
  }) => {
    const prefs = new NotificationPreferencesPage(adminPage);
    await prefs.goto();
    await prefs.expectVisible();
    await expect(prefs.notificationChannelsCard).toBeVisible();
  });

  test('teacher can view notification preferences', async ({
    teacherPage,
  }) => {
    const prefs = new NotificationPreferencesPage(teacherPage);
    await prefs.goto();
    await prefs.expectVisible();
  });

  test('parent can view notification preferences', async ({ parentPage }) => {
    const prefs = new NotificationPreferencesPage(parentPage);
    await prefs.goto();
    await prefs.expectVisible();
  });
});
