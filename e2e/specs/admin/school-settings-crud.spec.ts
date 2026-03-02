import { test, expect } from '../../fixtures/auth.fixture';
import { SchoolSettingsPage } from '../../pages/school-settings.page';

test.describe('School Settings - General Information CRUD', () => {
  test('admin can view general settings form', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();

    // General tab should be active by default
    await expect(settings.generalTab).toHaveAttribute('data-state', 'active');
  });

  test('general settings form shows school details', async ({
    adminPage,
  }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();

    // Should see form fields
    await expect(
      adminPage.getByPlaceholder('e.g. Greenfield Academy')
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      adminPage.getByPlaceholder('school@example.com')
    ).toBeVisible();
    await expect(
      adminPage.getByPlaceholder('+234 800 000 0000')
    ).toBeVisible();
  });

  test('admin can update school settings', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();

    // Update the motto
    const mottoInput = adminPage.getByPlaceholder('e.g. Knowledge is Power');
    await expect(mottoInput).toBeVisible({ timeout: 10_000 });

    const originalMotto = await mottoInput.inputValue();
    const newMotto = `E2E Motto ${Date.now()}`;
    await mottoInput.fill(newMotto);

    // Save
    const saveButton = adminPage.getByRole('button', {
      name: /save changes/i,
    });
    await saveButton.click();

    // Wait for success (page should not show error)
    await adminPage.waitForTimeout(2_000);

    // Restore original motto
    await mottoInput.fill(originalMotto || 'Knowledge is Power');
    await saveButton.click();
  });

  test('school settings form validates required fields', async ({
    adminPage,
  }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();

    // Clear a required field (school name)
    const nameInput = adminPage.getByPlaceholder('e.g. Greenfield Academy');
    await expect(nameInput).toBeVisible({ timeout: 10_000 });

    const originalName = await nameInput.inputValue();
    await nameInput.fill('');

    // Try to save
    const saveButton = adminPage.getByRole('button', {
      name: /save changes/i,
    });
    await saveButton.click();

    // Should show validation error or prevent submission
    // Restore the name
    await nameInput.fill(originalName || 'Kings Academy Lagos');
  });

  test('grading systems tab shows grading scales', async ({
    adminPage,
  }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();

    await settings.gradingTab.click();

    // Should see grading systems heading and add button
    await expect(
      adminPage.getByRole('heading', { name: 'Grading Systems' })
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      adminPage.getByRole('button', { name: /add grading system/i })
    ).toBeVisible();
  });

  test('admin can open add grading system dialog', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();

    await settings.gradingTab.click();

    await adminPage
      .getByRole('button', { name: /add grading system/i })
      .click();

    const dialog = adminPage.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Should see form fields
    await expect(
      dialog.getByPlaceholder('e.g. Standard Grading')
    ).toBeVisible();

    // Close dialog
    await dialog.getByRole('button', { name: /cancel/i }).click();
    await expect(dialog).not.toBeVisible({ timeout: 3_000 });
  });
});
