import { test, expect } from '../../fixtures/auth.fixture';
import { SchoolSettingsPage } from '../../pages/school-settings.page';

test.describe('School Settings', () => {
  test('admin can view school settings page', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();
  });

  test('admin sees all settings tabs', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();
    await expect(settings.generalTab).toBeVisible();
    await expect(settings.sessionsTab).toBeVisible();
    await expect(settings.classesTab).toBeVisible();
    await expect(settings.subjectsTab).toBeVisible();
    await expect(settings.gradingTab).toBeVisible();
  });
});
