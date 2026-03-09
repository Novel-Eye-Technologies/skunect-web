import { type Page, type Locator, expect } from '@playwright/test';

export class ManageSubjectsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly subjectsTab: Locator;
  readonly addSubjectButton: Locator;
  readonly dataTable: Locator;

  // Dialog elements
  readonly dialog: Locator;
  readonly subjectNameInput: Locator;
  readonly subjectCodeInput: Locator;
  readonly descriptionInput: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'School Settings' });
    this.subjectsTab = page.getByRole('tab', { name: 'Subjects' });
    this.addSubjectButton = page.getByRole('button', {
      name: /add subject/i,
    }).first();
    this.dataTable = page.locator('table');
    this.dialog = page.locator('[data-slot="dialog-content"]');
    this.subjectNameInput = page.getByPlaceholder('e.g. Mathematics');
    this.subjectCodeInput = page.getByPlaceholder('e.g. MATH101');
    this.descriptionInput = page.getByPlaceholder(
      'Brief description of the subject'
    );
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
  }

  async goto() {
    await this.page.goto('/school-settings');
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
    await this.subjectsTab.click();
  }

  async expectVisible() {
    await expect(this.addSubjectButton).toBeVisible({ timeout: 10_000 });
  }

  async expectTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }

  async clickAddSubject() {
    await this.addSubjectButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillSubjectForm(name: string, code: string, description?: string) {
    await this.subjectNameInput.fill(name);
    await this.subjectCodeInput.fill(code);
    if (description) {
      await this.descriptionInput.fill(description);
    }
  }

  async submitForm() {
    const submitButton = this.dialog.getByRole('button', {
      name: /create|update/i,
    });
    await submitButton.click();
  }

  async expectSubjectInTable(name: string) {
    await expect(this.dataTable.getByText(name)).toBeVisible({
      timeout: 10_000,
    });
  }

  async editSubject(name: string) {
    const row = this.dataTable.locator('tbody tr', { hasText: name });
    // Actions cell is last; first button = edit (pencil), second = delete (trash)
    const actionsCell = row.locator('td').last();
    await actionsCell.locator('button').first().click();
    await expect(this.dialog).toBeVisible();
  }

  async deleteSubject(name: string) {
    const row = this.dataTable.locator('tbody tr', { hasText: name });
    // Actions cell is last; second button = delete (trash)
    const actionsCell = row.locator('td').last();
    await actionsCell.locator('button').last().click();
    const confirmButton = this.page.getByRole('button', { name: /delete/i });
    await confirmButton.click();
  }

  async expectSubjectNotInTable(name: string) {
    await expect(this.dataTable.getByText(name)).not.toBeVisible({
      timeout: 5_000,
    });
  }
}
