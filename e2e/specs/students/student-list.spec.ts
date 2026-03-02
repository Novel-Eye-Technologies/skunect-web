import { test, expect } from '../../fixtures/auth.fixture';
import { StudentsPage } from '../../pages/students.page';

test.describe('Student List', () => {
  test('admin can view students list', async ({ adminPage }) => {
    const students = new StudentsPage(adminPage);
    await students.goto();
    await students.expectVisible();
    await expect(students.description).toBeVisible();
  });

  test('admin sees Add Student button', async ({ adminPage }) => {
    const students = new StudentsPage(adminPage);
    await students.goto();
    await students.expectVisible();
    await expect(students.addStudentButton).toBeVisible();
  });

  test('teacher can view students list', async ({ teacherPage }) => {
    const students = new StudentsPage(teacherPage);
    await students.goto();
    await students.expectVisible();
  });

  test('admin can search students', async ({ adminPage }) => {
    const students = new StudentsPage(adminPage);
    await students.goto();
    await students.expectVisible();
    await expect(students.searchInput).toBeVisible();
  });
});
