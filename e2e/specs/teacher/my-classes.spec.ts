import { test, expect } from '../../fixtures/auth.fixture';
import { MyClassesPage } from '../../pages/my-classes.page';

test.describe('My Classes', () => {
  test('teacher can view my classes page', async ({ teacherPage }) => {
    const myClasses = new MyClassesPage(teacherPage);
    await myClasses.goto();
    await myClasses.expectVisible();
    await expect(myClasses.description).toBeVisible();
  });

  test('admin can view my classes page', async ({ adminPage }) => {
    const myClasses = new MyClassesPage(adminPage);
    await myClasses.goto();
    await myClasses.expectVisible();
  });
});
