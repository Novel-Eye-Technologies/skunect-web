import { type Page, type Locator, expect } from '@playwright/test';

export class WelfarePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly recordWelfareButton: Locator;
  readonly dataTable: Locator;
  readonly classFilter: Locator;

  // Dialog elements
  readonly dialog: Locator;
  readonly classSelect: Locator;
  readonly studentSelect: Locator;
  readonly statusSelect: Locator;
  readonly notesTextarea: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /welfare/i });
    this.recordWelfareButton = page.getByRole('button', { name: /record welfare/i });
    this.dataTable = page.locator('table');
    this.classFilter = page.locator('button').filter({ hasText: /all classes/i });

    this.dialog = page.getByRole('dialog');
    this.classSelect = this.dialog.locator('button[role="combobox"]').first();
    this.studentSelect = this.dialog.locator('button[role="combobox"]').nth(1);
    this.statusSelect = this.dialog.locator('button[role="combobox"]').nth(2);
    this.notesTextarea = page.getByPlaceholder('Any additional observations...');
    this.saveButton = page.getByRole('button', { name: /save record/i });
    this.cancelButton = this.dialog.getByRole('button', { name: /cancel/i });
  }

  async goto() {
    await this.page.goto('/welfare');
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
  }

  async expectTableVisible() {
    await expect(this.dataTable).toBeVisible({ timeout: 10_000 });
  }

  async expectTableHeaders() {
    const headers = this.dataTable.locator('thead th');
    await expect(headers.getByText('Student')).toBeVisible();
    await expect(headers.getByText('Class')).toBeVisible();
    await expect(headers.getByText('Status')).toBeVisible();
  }

  async clickRecordWelfare() {
    await this.recordWelfareButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async selectClass(className: string) {
    await this.classSelect.click();
    await this.page.getByRole('option', { name: className }).click();
  }

  async selectStudent(studentName: string) {
    await this.studentSelect.click();
    await this.page.getByRole('option', { name: studentName }).click();
  }

  async selectStatus(status: string) {
    await this.statusSelect.click();
    await this.page.getByRole('option', { name: status }).click();
  }

  async fillNotes(notes: string) {
    await this.notesTextarea.fill(notes);
  }

  async submitForm() {
    await this.saveButton.click();
  }

  async cancelForm() {
    await this.cancelButton.click();
  }

  async filterByClass(className: string) {
    await this.classFilter.click();
    await this.page.getByRole('option', { name: className }).click();
  }

  async expectRecordInTable(studentName: string) {
    await expect(this.dataTable.getByText(studentName)).toBeVisible({ timeout: 10_000 });
  }

  async expectTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }
}
