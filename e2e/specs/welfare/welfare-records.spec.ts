import { test, expect } from '../../fixtures/auth.fixture';
import { WelfarePage } from '../../pages/welfare.page';

test.describe('Welfare Records Management (CRUD)', () => {
  test('admin can navigate to welfare page', async ({ adminPage }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await welfare.expectVisible();
  });

  test('welfare page shows correct title and description', async ({
    adminPage,
  }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await expect(
      adminPage.getByText(/record and track student welfare/i)
    ).toBeVisible();
  });

  test('welfare page shows Record Welfare button', async ({ adminPage }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await expect(welfare.recordWelfareButton).toBeVisible();
  });

  test('welfare table has correct headers', async ({ adminPage }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await welfare.expectTableVisible();
    await welfare.expectTableHeaders();
  });

  test('admin can open record welfare dialog', async ({ adminPage }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await welfare.clickRecordWelfare();
    await expect(welfare.dialog).toBeVisible();
    await expect(
      welfare.dialog.getByText(/record welfare observation/i)
    ).toBeVisible();
  });

  test('admin can create a welfare record', async ({ adminPage }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await welfare.expectVisible();

    await welfare.clickRecordWelfare();

    // Select class and wait for students API response
    await welfare.selectClassAndWaitForStudents(adminPage);

    // Select student (first available)
    await welfare.studentSelect.click();
    const studentOptions = adminPage.getByRole('option');
    await studentOptions.first().click();

    // Select status — use exact:true because 'Well' also matches 'Unwell'
    await welfare.statusSelect.click();
    await adminPage.getByRole('option', { name: 'Well', exact: true }).click();

    // Fill notes
    await welfare.fillNotes('E2E test welfare observation - student is doing well');

    await welfare.submitForm();

    // Dialog should close
    await expect(welfare.dialog).not.toBeVisible({ timeout: 5_000 });
  });

  test('admin can create welfare record with Unwell status', async ({
    adminPage,
  }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await welfare.expectVisible();

    await welfare.clickRecordWelfare();

    // Select class and wait for students API response
    await welfare.selectClassAndWaitForStudents(adminPage);

    // Select student
    await welfare.studentSelect.click();
    const studentOptions = adminPage.getByRole('option');
    await studentOptions.first().click();

    // Select Unwell status
    await welfare.statusSelect.click();
    await adminPage.getByRole('option', { name: 'Unwell', exact: true }).click();

    await welfare.fillNotes('Student has a mild headache');

    await welfare.submitForm();
    await expect(welfare.dialog).not.toBeVisible({ timeout: 10_000 });
  });

  test('cancel button closes dialog without saving', async ({
    adminPage,
  }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await welfare.clickRecordWelfare();

    // Fill partial data
    await welfare.fillNotes('This should not be saved');
    await welfare.cancelForm();

    await expect(welfare.dialog).not.toBeVisible({ timeout: 3_000 });
  });

  test('admin can filter welfare records by class', async ({ adminPage }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await welfare.expectVisible();
    await welfare.expectTableVisible();

    // Open class filter
    await welfare.classFilter.click();
    const options = adminPage.getByRole('option');
    const optionCount = await options.count();

    if (optionCount > 1) {
      // Select the second option (first non-"All" option)
      await options.nth(1).click();
      await adminPage.waitForTimeout(1_000);
      await welfare.expectTableVisible();
    } else {
      // Close dropdown if no filter options
      await adminPage.keyboard.press('Escape');
    }
  });

  test('admin can reset class filter to All Classes', async ({
    adminPage,
  }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await welfare.expectVisible();
    await welfare.expectTableVisible();

    // Apply filter first — click the class filter select trigger
    const filterTrigger = adminPage.locator('button[role="combobox"]').filter({ hasText: /class/i }).first();
    await filterTrigger.click();
    const options = adminPage.getByRole('option');
    const optionCount = await options.count();

    if (optionCount > 1) {
      await options.nth(1).click();
      await adminPage.waitForTimeout(500);

      // Reset to All Classes — the trigger text has changed to the selected class name
      // so we need to locate it differently
      const trigger = adminPage.locator('button[role="combobox"]').first();
      await trigger.click();
      await adminPage.getByRole('option', { name: /all classes/i }).click();
      await adminPage.waitForTimeout(1_000);
      await welfare.expectTableVisible();
    } else {
      await adminPage.keyboard.press('Escape');
    }
  });

  test('welfare dialog requires class and student selection', async ({
    adminPage,
  }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await welfare.clickRecordWelfare();

    // Student select should be disabled when no class is selected
    await expect(welfare.studentSelect).toBeDisabled();
  });

  test('teacher can access welfare page', async ({ teacherPage }) => {
    const welfare = new WelfarePage(teacherPage);
    await welfare.goto();
    await welfare.expectVisible();
  });

  test('teacher can record welfare observation', async ({ teacherPage }) => {
    const welfare = new WelfarePage(teacherPage);
    await welfare.goto();
    await welfare.expectVisible();

    await welfare.clickRecordWelfare();
    await expect(welfare.dialog).toBeVisible();

    // Select class and wait for students API response
    await welfare.selectClassAndWaitForStudents(teacherPage);

    // Select student
    await welfare.studentSelect.click();
    const studentOptions = teacherPage.getByRole('option');
    await studentOptions.first().click();

    // Select status
    await welfare.statusSelect.click();
    await teacherPage.getByRole('option', { name: 'Upset', exact: true }).click();

    await welfare.fillNotes('Teacher recorded: student seemed upset during class');

    await welfare.submitForm();
    await expect(welfare.dialog).not.toBeVisible({ timeout: 5_000 });
  });
});
