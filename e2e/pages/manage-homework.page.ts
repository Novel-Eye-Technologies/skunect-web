import { type Page, type Locator, expect } from '@playwright/test';

export class ManageHomeworkPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly createButton: Locator;
  readonly dataTable: Locator;
  readonly dialog: Locator;

  // Form elements
  readonly titleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly maxScoreInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /homework/i });
    this.description = page.getByText(
      'Manage homework assignments and submissions.'
    );
    this.createButton = page.getByRole('button', {
      name: /create assignment/i,
    });
    this.dataTable = page.locator('table');
    this.dialog = page.getByRole('dialog');
    this.titleInput = page.getByPlaceholder('e.g. Chapter 5 Questions');
    this.descriptionTextarea = page.getByPlaceholder(
      'Describe the assignment...'
    );
    this.maxScoreInput = page.getByPlaceholder('100');
  }

  async goto() {
    await this.page.goto('/homework');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async expectTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }

  async clickCreate() {
    await this.createButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillHomeworkForm(
    title: string,
    description: string,
    maxScore?: string
  ) {
    await this.titleInput.fill(title);
    await this.descriptionTextarea.fill(description);
    if (maxScore) {
      await this.maxScoreInput.fill(maxScore);
    }
  }

  async selectClass(className: string | RegExp) {
    // Click the Class combobox/select and choose the first matching class.
    // Options load asynchronously — wait for them to appear.
    const classSelects = this.dialog.getByRole('combobox');
    await classSelects.first().click();
    const option = this.page.getByRole('option', { name: className }).first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
  }

  async selectSubject(subjectName: string | RegExp) {
    const subjectSelects = this.dialog.getByRole('combobox');
    await subjectSelects.nth(1).click();
    const option = this.page.getByRole('option', { name: subjectName }).first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
  }

  async setDates(assignedDate: string, dueDate: string) {
    const dateInputs = this.dialog.locator('input[type="date"]');
    await dateInputs.first().fill(assignedDate);
    await dateInputs.last().fill(dueDate);
  }

  async submitForm() {
    const submitButton = this.dialog.getByRole('button', {
      name: /create assignment|save changes/i,
    });
    await submitButton.click();
  }

  async expectHomeworkInTable(title: string) {
    await expect(this.dataTable.getByText(title)).toBeVisible({
      timeout: 10_000,
    });
  }

  async openRowActions(title: string) {
    const row = this.dataTable.locator('tr', { hasText: title });
    await row.getByRole('button').last().click();
  }

  async clickRowAction(action: string) {
    await this.page.getByRole('menuitem', { name: action }).click();
  }

  async deleteHomework(title: string) {
    await this.openRowActions(title);
    await this.clickRowAction('Delete');
    // Confirm dialog uses role="alertdialog"
    const alertDialog = this.page.locator('[role="alertdialog"]');
    await expect(alertDialog).toBeVisible({ timeout: 3_000 });
    const confirmButton = alertDialog.getByRole('button', { name: /delete/i });
    await confirmButton.click();
    await expect(alertDialog).not.toBeVisible({ timeout: 5_000 });
  }

  async expectHomeworkNotInTable(title: string) {
    await expect(this.dataTable.getByText(title)).not.toBeVisible({
      timeout: 5_000,
    });
  }
}
