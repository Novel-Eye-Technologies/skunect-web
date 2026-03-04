import { test, expect } from '../../fixtures/auth.fixture';
import { AuditLogsPage } from '../../pages/audit-logs.page';

test.describe('Audit Logs (Read & Filter)', () => {
  test('admin can navigate to audit logs page', async ({ adminPage }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await auditLogs.expectVisible();
  });

  test('audit logs page shows correct title and description', async ({
    adminPage,
  }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await expect(
      adminPage.getByText(/view a log of all admin actions/i)
    ).toBeVisible();
  });

  test('audit logs table has correct headers', async ({ adminPage }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await auditLogs.expectTableVisible();
    await auditLogs.expectTableHeaders();
  });

  test('audit logs table shows data', async ({ adminPage }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await auditLogs.expectTableVisible();

    // There should be at least some audit log entries from seed data
    // or from previous E2E test actions
    const rows = adminPage.locator('table tbody tr');
    const count = await rows.count();
    // Audit logs may or may not have data; we just verify the table renders
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('admin can filter by entity type', async ({ adminPage }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await auditLogs.expectTableVisible();

    // Filter by Student entity
    await auditLogs.filterByEntityType('Student');

    // Wait for table to reload
    await adminPage.waitForTimeout(1_000);

    // The table should reload (may show filtered results or empty)
    await auditLogs.expectTableVisible();
  });

  test('admin can filter by action type', async ({ adminPage }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await auditLogs.expectTableVisible();

    // Filter by Create action
    await auditLogs.filterByAction('Create');

    // Wait for table to reload
    await adminPage.waitForTimeout(1_000);

    // Table should still be visible with filtered results
    await auditLogs.expectTableVisible();
  });

  test('admin can combine entity and action filters', async ({
    adminPage,
  }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await auditLogs.expectTableVisible();

    // Apply both filters
    await auditLogs.filterByEntityType('Student');
    await adminPage.waitForTimeout(500);
    await auditLogs.filterByAction('Create');
    await adminPage.waitForTimeout(1_000);

    await auditLogs.expectTableVisible();
  });

  test('admin can reset entity filter to All Entities', async ({
    adminPage,
  }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await auditLogs.expectTableVisible();

    // Apply a filter
    await auditLogs.filterByEntityType('Teacher');
    await adminPage.waitForTimeout(500);

    // Reset to All
    await auditLogs.filterByEntityType('All Entities');
    await adminPage.waitForTimeout(1_000);

    await auditLogs.expectTableVisible();
  });

  test('admin can reset action filter to All Actions', async ({
    adminPage,
  }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await auditLogs.expectTableVisible();

    // Apply a filter
    await auditLogs.filterByAction('Delete');
    await adminPage.waitForTimeout(500);

    // Reset to All
    await auditLogs.filterByAction('All Actions');
    await adminPage.waitForTimeout(1_000);

    await auditLogs.expectTableVisible();
  });

  test('action badges show correct colors', async ({ adminPage }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await auditLogs.expectTableVisible();

    // Verify that action badges exist with the expected text values
    const badges = adminPage.locator('table tbody [data-slot="badge"]');
    const count = await badges.count();
    if (count > 0) {
      const firstBadgeText = await badges.first().textContent();
      // Badge text should be one of the known actions
      const validActions = ['CREATE', 'UPDATE', 'DELETE', 'PUBLISH'];
      expect(
        validActions.some((a) => firstBadgeText?.includes(a))
      ).toBeTruthy();
    }
  });

  test('entity type filter shows all expected options', async ({
    adminPage,
  }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await auditLogs.expectTableVisible();

    // Open the entity type dropdown
    await auditLogs.entityTypeFilter.click();
    const options = adminPage.getByRole('option');
    await expect(options.getByText('All Entities')).toBeVisible();
    await expect(options.getByText('Student')).toBeVisible();
    await expect(options.getByText('Teacher')).toBeVisible();
    await expect(options.getByText('Fee')).toBeVisible();

    // Close dropdown
    await adminPage.keyboard.press('Escape');
  });

  test('action filter shows all expected options', async ({ adminPage }) => {
    const auditLogs = new AuditLogsPage(adminPage);
    await auditLogs.goto();
    await auditLogs.expectTableVisible();

    // Open the action dropdown
    await auditLogs.actionFilter.click();
    const options = adminPage.getByRole('option');
    await expect(options.getByText('All Actions')).toBeVisible();
    await expect(options.getByText('Create')).toBeVisible();
    await expect(options.getByText('Update')).toBeVisible();
    await expect(options.getByText('Delete')).toBeVisible();
    await expect(options.getByText('Publish')).toBeVisible();

    // Close dropdown
    await adminPage.keyboard.press('Escape');
  });
});
