import { test, expect } from '../../fixtures/auth.fixture';
import { StudentsPage } from '../../pages/students.page';

test.describe('Parent - My Children', () => {
  test('parent can view their children', async ({ parentPage }) => {
    // Parent sees "My Children" in the nav, but the page heading is "Students"
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();
  });

  test('parent sees the students page with heading', async ({ parentPage }) => {
    const students = new StudentsPage(parentPage);
    await students.goto();
    await students.expectVisible();

    // Verify the page shows the Students heading (displayed as "Students"
    // even though the nav item is "My Children" for parents)
    await expect(students.heading).toBeVisible();
  });
});
