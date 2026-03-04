import { test, expect } from '../../fixtures/auth.fixture';
import { HealthRecordsPage } from '../../pages/health-records.page';

test.describe('Health Records', () => {
  test('admin can view health records page', async ({ adminPage }) => {
    const healthRecords = new HealthRecordsPage(adminPage);
    await healthRecords.goto();
    await healthRecords.expectVisible();
    await expect(healthRecords.description).toBeVisible();
  });

  test('admin sees Add Record button', async ({ adminPage }) => {
    const healthRecords = new HealthRecordsPage(adminPage);
    await healthRecords.goto();
    await healthRecords.expectVisible();
    await expect(healthRecords.addRecordButton).toBeVisible();
  });

  test('admin can open add record dialog', async ({ adminPage }) => {
    const healthRecords = new HealthRecordsPage(adminPage);
    await healthRecords.goto();
    await healthRecords.expectVisible();
    const dialog = await healthRecords.openAddRecordDialog();
    await expect(dialog.getByText('Add Health Record')).toBeVisible();
  });

  test('teacher can view health records page', async ({ teacherPage }) => {
    const healthRecords = new HealthRecordsPage(teacherPage);
    await healthRecords.goto();
    await healthRecords.expectVisible();
    await expect(healthRecords.addRecordButton).toBeVisible();
  });
});
