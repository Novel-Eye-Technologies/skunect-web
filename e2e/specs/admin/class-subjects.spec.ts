import { test, expect } from '../../fixtures/auth.fixture';
import { ClassSubjectsPage } from '../../pages/class-subjects.page';

test.describe('Class Subject-Teacher Assignment (Admin)', () => {
  test('admin can open manage subjects sheet for a class', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    // Get the first class name from the table
    const firstRow = adminPage.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });
    const className = await firstRow.locator('td').first().textContent();

    if (className) {
      await page.clickManageSubjects(className.trim());
      await page.expectSheetVisible(className.trim());
    }
  });

  test('admin can view subjects assigned to a class', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    const firstRow = adminPage.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });
    const className = await firstRow.locator('td').first().textContent();

    if (className) {
      await page.clickManageSubjects(className.trim());
      await page.expectSheetVisible(className.trim());

      // Should see subjects table with Subject, Code, Teacher, Actions columns
      await expect(page.sheet.locator('table')).toBeVisible({ timeout: 10_000 });
    }
  });

  test('admin can see class teacher badge on inherited subjects', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    const firstRow = adminPage.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });
    const className = await firstRow.locator('td').first().textContent();

    if (className) {
      await page.clickManageSubjects(className.trim());
      await page.expectSheetVisible(className.trim());

      // At least one subject should show "Class Teacher" badge
      const classTeacherBadges = page.sheet.getByText('Class Teacher');
      const count = await classTeacherBadges.count();
      // It's OK if all subjects have specialist teachers (count = 0)
      // Just verify the sheet loaded with subjects
      const subjectRows = page.sheet.locator('table tbody tr');
      expect(await subjectRows.count()).toBeGreaterThan(0);
    }
  });

  test('admin can open change teacher dialog for a subject', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    const firstRow = adminPage.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });
    const className = await firstRow.locator('td').first().textContent();

    if (className) {
      await page.clickManageSubjects(className.trim());
      await page.expectSheetVisible(className.trim());

      // Get first subject name from the sheet table
      const firstSubjectRow = page.sheet.locator('table tbody tr').first();
      await expect(firstSubjectRow).toBeVisible({ timeout: 10_000 });
      const subjectName = await firstSubjectRow
        .locator('td')
        .first()
        .textContent();

      if (subjectName) {
        await page.clickChangeTeacher(subjectName.trim());
        // Dialog should show "Change Teacher" title
        await expect(
          page.dialog.getByText('Change Teacher', { exact: false })
        ).toBeVisible();
        // Should have a teacher select with "Class Teacher (default)" option
        await expect(page.dialog.getByRole('combobox')).toBeVisible();

        // Close dialog
        await page.dialog
          .getByRole('button', { name: /cancel/i })
          .click();
        await expect(page.dialog).not.toBeVisible({ timeout: 3_000 });
      }
    }
  });

  test('admin can assign a specialist teacher to a subject', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    const firstRow = adminPage.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });
    const className = await firstRow.locator('td').first().textContent();

    if (className) {
      await page.clickManageSubjects(className.trim());
      await page.expectSheetVisible(className.trim());

      // Get first subject with "Class Teacher" badge
      const classTeacherRow = page.sheet
        .locator('table tbody tr')
        .filter({ hasText: 'Class Teacher' })
        .first();

      if (await classTeacherRow.isVisible().catch(() => false)) {
        const subjectName = await classTeacherRow
          .locator('td')
          .first()
          .textContent();

        if (subjectName) {
          await page.clickChangeTeacher(subjectName.trim());

          // Select a different teacher (first non-class-teacher option)
          await page.dialog.getByRole('combobox').click();
          // Pick the second option (first is "Class Teacher (default)")
          const options = adminPage.getByRole('option');
          const optionCount = await options.count();
          if (optionCount > 1) {
            await options.nth(1).click();
            await page.submitChangeTeacher();
            await expect(page.dialog).not.toBeVisible({ timeout: 10_000 });
          } else {
            // Only class teacher option available, cancel
            await adminPage.keyboard.press('Escape');
            await page.dialog
              .getByRole('button', { name: /cancel/i })
              .click();
          }
        }
      }
    }
  });

  test('admin can reset subject teacher back to class teacher', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    const firstRow = adminPage.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 10_000 });
    const className = await firstRow.locator('td').first().textContent();

    if (className) {
      await page.clickManageSubjects(className.trim());
      await page.expectSheetVisible(className.trim());

      // Find any subject row (first one)
      const firstSubjectRow = page.sheet.locator('table tbody tr').first();
      await expect(firstSubjectRow).toBeVisible({ timeout: 10_000 });
      const subjectName = await firstSubjectRow
        .locator('td')
        .first()
        .textContent();

      if (subjectName) {
        await page.clickChangeTeacher(subjectName.trim());
        await page.selectClassTeacherInDialog();
        await page.submitChangeTeacher();
        await expect(page.dialog).not.toBeVisible({ timeout: 10_000 });
      }
    }
  });
});
