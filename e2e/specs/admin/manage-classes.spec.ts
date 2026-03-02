import { test, expect } from '../../fixtures/auth.fixture';
import { ManageClassesPage } from '../../pages/manage-classes.page';

test.describe('Classes Management (CRUD)', () => {
  const uniqueClassName = `E2E Class ${Date.now()}`;

  test('admin can view classes tab', async ({ adminPage }) => {
    const classes = new ManageClassesPage(adminPage);
    await classes.goto();
    await classes.expectVisible();
  });

  test('admin sees existing classes in table', async ({ adminPage }) => {
    const classes = new ManageClassesPage(adminPage);
    await classes.goto();
    await classes.expectVisible();
    await classes.expectTableNotEmpty();
  });

  test('admin can create a new class', async ({ adminPage }) => {
    const classes = new ManageClassesPage(adminPage);
    await classes.goto();
    await classes.expectVisible();

    await classes.clickAddClass();
    await classes.fillClassForm(uniqueClassName, 'A', '30');
    await classes.submitForm();

    // Dialog should close
    await expect(classes.dialog).not.toBeVisible({ timeout: 5_000 });
    // New class should appear in table
    await classes.expectClassInTable(uniqueClassName);
  });

  test('admin can edit a class', async ({ adminPage }) => {
    const classes = new ManageClassesPage(adminPage);
    await classes.goto();
    await classes.expectVisible();
    await classes.expectTableNotEmpty();

    // Edit the first class by clicking its edit button
    const firstRow = classes.dataTable.locator('tbody tr').first();
    const className = await firstRow.locator('td').first().textContent();
    await firstRow.getByRole('button').first().click();

    await expect(classes.dialog).toBeVisible();
    // Update the capacity
    await classes.capacityInput.fill('35');
    await classes.submitForm();

    await expect(classes.dialog).not.toBeVisible({ timeout: 5_000 });
  });

  test('admin can delete a class', async ({ adminPage }) => {
    const classes = new ManageClassesPage(adminPage);
    await classes.goto();
    await classes.expectVisible();

    // First create a class to delete
    const deleteClassName = `Delete Me ${Date.now()}`;
    await classes.clickAddClass();
    await classes.fillClassForm(deleteClassName, '', '10');
    await classes.submitForm();
    await expect(classes.dialog).not.toBeVisible({ timeout: 5_000 });
    await classes.expectClassInTable(deleteClassName);

    // Now delete it
    await classes.deleteClass(deleteClassName);
    await classes.expectClassNotInTable(deleteClassName);
  });

  test('cancel button closes the dialog without saving', async ({
    adminPage,
  }) => {
    const classes = new ManageClassesPage(adminPage);
    await classes.goto();
    await classes.expectVisible();

    await classes.clickAddClass();
    await classes.fillClassForm('Should Not Save', 'X', '5');
    await classes.cancelButton.click();

    await expect(classes.dialog).not.toBeVisible({ timeout: 3_000 });
  });
});
