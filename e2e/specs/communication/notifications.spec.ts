import { test, expect } from '../../fixtures/auth.fixture';
import { NotificationsPage } from '../../pages/communication.page';

/**
 * There is no standalone notifications page.
 * These tests verify that users can access the communication section
 * (which is where notifications would be accessible).
 */
test.describe('Notifications (Communication Section)', () => {
  test('admin can access communication section', async ({ adminPage }) => {
    const notifications = new NotificationsPage(adminPage);
    await notifications.goto();
    await notifications.expectVisible();
  });

  test('teacher can access communication section', async ({ teacherPage }) => {
    const notifications = new NotificationsPage(teacherPage);
    await notifications.goto();
    await notifications.expectVisible();
  });

  test('parent can access communication section', async ({ parentPage }) => {
    const notifications = new NotificationsPage(parentPage);
    await notifications.goto();
    await notifications.expectVisible();
  });
});
