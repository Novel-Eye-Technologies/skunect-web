import { type Page, type Locator, expect } from '@playwright/test';

export class ClassSubjectsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly classesCard: Locator;
  readonly sheet: Locator;
  readonly dialog: Locator;
  readonly alertDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'School Settings' });
    this.classesCard = page.locator('text=Classes').first();
    this.sheet = page.locator('[data-slot="sheet-content"]');
    this.dialog = page.locator('[data-slot="dialog-content"]');
    this.alertDialog = page.locator('[role="alertdialog"]');
  }

  async goto() {
    await this.page.goto('/school-settings');
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
    // Navigate to Classes tab
    await this.page.getByRole('tab', { name: 'Classes' }).click();
    await expect(
      this.page.getByText('Classes', { exact: true }).first()
    ).toBeVisible({ timeout: 10_000 });
  }

  async clickManageSubjects(className: string) {
    const row = this.page.locator('table tbody tr', { hasText: className });
    await row.getByTitle('Manage subjects').click();
    await expect(this.sheet).toBeVisible({ timeout: 5_000 });
  }

  async expectSheetVisible(className: string) {
    await expect(
      this.sheet.getByText(`Subjects — ${className}`)
    ).toBeVisible({ timeout: 5_000 });
  }

  async expectSubjectInSheet(subjectName: string) {
    await expect(this.sheet.getByText(subjectName)).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectSubjectNotInSheet(subjectName: string) {
    await expect(this.sheet.getByText(subjectName)).not.toBeVisible({
      timeout: 5_000,
    });
  }

  async clickAddSubjects() {
    await this.sheet.getByRole('button', { name: /add subjects/i }).click();
    await expect(this.dialog).toBeVisible();
  }

  async selectSubjectInDialog(subjectName: string) {
    await this.dialog.locator('label', { hasText: subjectName }).click();
  }

  async submitAddSubjects() {
    await this.dialog.getByRole('button', { name: /^add/i }).click();
  }

  async clickChangeTeacher(subjectName: string) {
    const row = this.sheet.locator('table tbody tr', {
      hasText: subjectName,
    });
    await row.getByTitle('Change teacher').click();
    await expect(this.dialog).toBeVisible();
  }

  async selectTeacherInDialog(teacherName: string) {
    await this.dialog.getByRole('combobox').click();
    await this.page
      .getByRole('option', { name: teacherName })
      .click();
  }

  async selectClassTeacherInDialog() {
    await this.dialog.getByRole('combobox').click();
    await this.page
      .getByRole('option', { name: 'Class Teacher (default)' })
      .click();
  }

  async submitChangeTeacher() {
    await this.dialog.getByRole('button', { name: /save/i }).click();
  }

  async clickRemoveSubject(subjectName: string) {
    const row = this.sheet.locator('table tbody tr', {
      hasText: subjectName,
    });
    await row.getByTitle('Remove subject').click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async confirmRemove() {
    await this.alertDialog
      .getByRole('button', { name: /remove/i })
      .click();
    await expect(this.alertDialog).not.toBeVisible({ timeout: 5_000 });
  }

  async closeSheet() {
    // Click the X button on the sheet
    const closeBtn = this.sheet.locator('button[class*="absolute"]').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
    await expect(this.sheet).not.toBeVisible({ timeout: 3_000 });
  }

  async expectClassTeacherBadge(subjectName: string) {
    const row = this.sheet.locator('table tbody tr', {
      hasText: subjectName,
    });
    await expect(row.getByText('Class Teacher')).toBeVisible();
  }

  async expectSubjectTeacherBadgeAbsent(subjectName: string) {
    const row = this.sheet.locator('table tbody tr', {
      hasText: subjectName,
    });
    await expect(row.getByText('Class Teacher')).not.toBeVisible();
  }
}
