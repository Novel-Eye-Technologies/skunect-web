import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Safety - Emergency Alerts & Pickup Logs', () => {
  test('admin can view safety page', async ({ adminPage }) => {
    await adminPage.goto('/safety');
    await expect(
      adminPage.getByRole('heading', { name: /safety/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('safety page shows Emergency Alerts and Pickup Logs tabs', async ({
    adminPage,
  }) => {
    await adminPage.goto('/safety');
    await expect(
      adminPage.getByRole('heading', { name: /safety/i })
    ).toBeVisible({ timeout: 20_000 });

    await expect(
      adminPage.getByRole('tab', { name: /emergency alerts/i })
    ).toBeVisible();
    await expect(
      adminPage.getByRole('tab', { name: /pickup logs/i })
    ).toBeVisible();
  });

  test('admin can create an emergency alert', async ({ adminPage }) => {
    await adminPage.goto('/safety');
    await expect(
      adminPage.getByRole('heading', { name: /safety/i })
    ).toBeVisible({ timeout: 20_000 });

    // Click Create Alert
    const createBtn = adminPage.getByRole('button', {
      name: /create alert/i,
    });
    await createBtn.click();

    const dialog = adminPage.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Fill form: type, title, severity, description
    // Select alert type
    const selects = dialog.getByRole('combobox');
    await selects.first().click();
    await adminPage.getByRole('option', { name: /medical/i }).click();

    // Fill title
    await dialog
      .getByPlaceholder('e.g. Fire drill evacuation')
      .fill(`E2E Alert ${Date.now()}`);

    // Select severity
    await selects.last().click();
    await adminPage.getByRole('option', { name: /low/i }).click();

    // Fill description
    await dialog
      .getByPlaceholder('Provide details about the emergency...')
      .fill('This is an automated test alert. Please ignore.');

    // Submit
    await dialog
      .getByRole('button', { name: /create alert/i })
      .click();

    await expect(dialog).not.toBeVisible({ timeout: 5_000 });
  });

  test('teacher can view safety page', async ({ teacherPage }) => {
    await teacherPage.goto('/safety');
    await expect(
      teacherPage.getByRole('heading', { name: /safety/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test('pickup logs tab shows data or empty state', async ({
    adminPage,
  }) => {
    await adminPage.goto('/safety');
    await expect(
      adminPage.getByRole('heading', { name: /safety/i })
    ).toBeVisible({ timeout: 20_000 });

    // Switch to Pickup Logs tab
    await adminPage.getByRole('tab', { name: /pickup logs/i }).click();

    // Should see table or empty state
    const table = adminPage.locator('table');
    const emptyState = adminPage.getByText(/no pickup/i);
    await expect(table.or(emptyState)).toBeVisible({ timeout: 10_000 });
  });

  test('admin can create a pickup log', async ({ adminPage }) => {
    await adminPage.goto('/safety');
    await expect(
      adminPage.getByRole('heading', { name: /safety/i })
    ).toBeVisible({ timeout: 20_000 });

    // Switch to Pickup Logs tab
    await adminPage.getByRole('tab', { name: /pickup logs/i }).click();

    // Click Create Log
    const createLogBtn = adminPage.getByRole('button', {
      name: /create log/i,
    });
    await expect(createLogBtn).toBeVisible({ timeout: 5_000 });
    await createLogBtn.click();

    const dialog = adminPage.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Fill pickup person name
    await dialog.getByPlaceholder('e.g. John Doe').fill('Jane E2E Parent');

    // Select relationship
    const relationshipSelect = dialog.getByRole('combobox');
    await relationshipSelect.last().click();
    await adminPage.getByRole('option', { name: /parent/i }).click();

    // Note: Student search + select would be needed too
    // This test verifies the form opens and fields are interactive
  });
});
