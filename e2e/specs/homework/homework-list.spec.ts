import { test, expect } from '../../fixtures/auth.fixture';
import { HomeworkPage } from '../../pages/homework.page';

test.describe('Homework', () => {
  test('admin can view homework page', async ({ adminPage }) => {
    const homework = new HomeworkPage(adminPage);
    await homework.goto();
    await homework.expectVisible();
    await expect(homework.description).toBeVisible();
  });

  test('admin sees Create Assignment button', async ({ adminPage }) => {
    const homework = new HomeworkPage(adminPage);
    await homework.goto();
    await homework.expectVisible();
    await expect(homework.createButton).toBeVisible();
  });

  test('teacher can view homework page', async ({ teacherPage }) => {
    const homework = new HomeworkPage(teacherPage);
    await homework.goto();
    await homework.expectVisible();
  });

  test('parent can view homework page', async ({ parentPage }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
  });
});
