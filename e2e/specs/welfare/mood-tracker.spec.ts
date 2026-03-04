import { test, expect } from '../../fixtures/auth.fixture';
import { MoodTrackerPage } from '../../pages/mood-tracker.page';

test.describe('Mood Tracker', () => {
  test('admin can view mood tracker page', async ({ adminPage }) => {
    const moodTracker = new MoodTrackerPage(adminPage);
    await moodTracker.goto();
    await moodTracker.expectVisible();
    await expect(moodTracker.description).toBeVisible();
  });

  test('admin sees Log Mood button', async ({ adminPage }) => {
    const moodTracker = new MoodTrackerPage(adminPage);
    await moodTracker.goto();
    await moodTracker.expectVisible();
    await expect(moodTracker.logMoodButton).toBeVisible();
  });

  test('admin can open log mood dialog', async ({ adminPage }) => {
    const moodTracker = new MoodTrackerPage(adminPage);
    await moodTracker.goto();
    await moodTracker.expectVisible();
    const dialog = await moodTracker.openLogMoodDialog();
    await expect(dialog.getByText('Log Mood Entry')).toBeVisible();
  });

  test('teacher can view mood tracker page', async ({ teacherPage }) => {
    const moodTracker = new MoodTrackerPage(teacherPage);
    await moodTracker.goto();
    await moodTracker.expectVisible();
    await expect(moodTracker.logMoodButton).toBeVisible();
  });
});
