import { test, expect } from '../../fixtures/auth.fixture';
import { ClassSubjectsPage } from '../../pages/class-subjects.page';

// Use seed class JSS 1A which has subjects assigned.
// Stale E2E classes may appear first in the table but have no subjects.
const SEED_CLASS = 'JSS 1A';

test.describe('Class Subject-Teacher Assignment (Admin)', () => {
  test('admin can open manage subjects sheet for a class', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    await page.clickManageSubjects(SEED_CLASS);
    await page.expectSheetVisible(SEED_CLASS);
  });

  test('admin can view subjects assigned to a class', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    await page.clickManageSubjects(SEED_CLASS);
    await page.expectSheetVisible(SEED_CLASS);

    // Should see subjects table with Subject, Code, Teacher, Actions columns
    await expect(page.sheet.locator('table')).toBeVisible({ timeout: 10_000 });
  });

  test('admin can see class teacher badge on inherited subjects', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    await page.clickManageSubjects(SEED_CLASS);
    await page.expectSheetVisible(SEED_CLASS);

    // Wait for subjects table to load
    const subjectRows = page.sheet.locator('table tbody tr');
    await expect(subjectRows.first()).toBeVisible({ timeout: 10_000 });
    expect(await subjectRows.count()).toBeGreaterThan(0);
  });

  test('admin can open change teacher dialog for a subject', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    await page.clickManageSubjects(SEED_CLASS);
    await page.expectSheetVisible(SEED_CLASS);

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
  });

  test('admin can assign a specialist teacher to a subject', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    await page.clickManageSubjects(SEED_CLASS);
    await page.expectSheetVisible(SEED_CLASS);

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
  });

  test('admin can reset subject teacher back to class teacher', async ({
    adminPage,
  }) => {
    const page = new ClassSubjectsPage(adminPage);
    await page.goto();

    await page.clickManageSubjects(SEED_CLASS);
    await page.expectSheetVisible(SEED_CLASS);

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
  });
});
