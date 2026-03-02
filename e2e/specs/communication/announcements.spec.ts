import { test, expect } from '../../fixtures/auth.fixture';
import { AnnouncementsPage } from '../../pages/communication.page';

test.describe('Announcements', () => {
  test('admin can view announcements page', async ({ adminPage }) => {
    const announcements = new AnnouncementsPage(adminPage);
    await announcements.goto();
    await announcements.expectVisible();
    await expect(announcements.description).toBeVisible();
  });

  test('admin sees Create Announcement button', async ({ adminPage }) => {
    const announcements = new AnnouncementsPage(adminPage);
    await announcements.goto();
    await announcements.expectVisible();
    await expect(announcements.createButton).toBeVisible();
  });

  test('teacher can view announcements page', async ({ teacherPage }) => {
    const announcements = new AnnouncementsPage(teacherPage);
    await announcements.goto();
    await announcements.expectVisible();
  });

  test('parent can view announcements page', async ({ parentPage }) => {
    const announcements = new AnnouncementsPage(parentPage);
    await announcements.goto();
    await announcements.expectVisible();
  });
});
