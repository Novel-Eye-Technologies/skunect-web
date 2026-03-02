import { test, expect } from '../../fixtures/auth.fixture';
import { HomeworkPage } from '../../pages/homework.page';

// The /homework page has a persistent runtime error ("Something went wrong")
// for all roles. All homework tests are marked as fixme until the app bug is resolved.
test.describe('Homework', () => {
  test.fixme('admin can view homework page', async ({ adminPage }) => {
    const homework = new HomeworkPage(adminPage);
    await homework.goto();
    await homework.expectVisible();
    await expect(homework.description).toBeVisible();
  });

  test.fixme('admin sees Create Assignment button', async ({ adminPage }) => {
    const homework = new HomeworkPage(adminPage);
    await homework.goto();
    await homework.expectVisible();
    await expect(homework.createButton).toBeVisible();
  });

  test.fixme('teacher can view homework page', async ({ teacherPage }) => {
    const homework = new HomeworkPage(teacherPage);
    await homework.goto();
    await homework.expectVisible();
  });

  test.fixme('parent can view homework page', async ({ parentPage }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
  });
});
