import { test, expect } from '../../fixtures/auth.fixture';
import { AttendancePage } from '../../pages/attendance.page';

test.describe('Attendance', () => {
  test('admin can view attendance page', async ({ adminPage }) => {
    const attendance = new AttendancePage(adminPage);
    await attendance.goto();
    await attendance.expectVisible();
    await expect(attendance.description).toBeVisible();
  });

  test('admin sees Mark Attendance and Records tabs', async ({
    adminPage,
  }) => {
    const attendance = new AttendancePage(adminPage);
    await attendance.goto();
    await attendance.expectVisible();
    await expect(attendance.markAttendanceTab).toBeVisible();
    await expect(attendance.recordsTab).toBeVisible();
  });

  test('teacher can view attendance page', async ({ teacherPage }) => {
    const attendance = new AttendancePage(teacherPage);
    await attendance.goto();
    await attendance.expectVisible();
  });

  test('admin can switch to Records tab', async ({ adminPage }) => {
    const attendance = new AttendancePage(adminPage);
    await attendance.goto();
    await attendance.expectVisible();
    await attendance.switchToRecords();
  });
});
