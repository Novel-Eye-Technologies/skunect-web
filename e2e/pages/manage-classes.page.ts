import { type Page, type Locator, expect } from '@playwright/test';

export class ManageClassesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly classesTab: Locator;
  readonly addClassButton: Locator;
  readonly dataTable: Locator;

  // Dialog elements
  readonly dialog: Locator;
  readonly classNameInput: Locator;
  readonly sectionInput: Locator;
  readonly capacityInput: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'School Settings' });
    this.classesTab = page.getByRole('tab', { name: 'Classes' });
    this.addClassButton = page.getByRole('button', { name: /add class/i });
    this.dataTable = page.locator('table');
    this.dialog = page.getByRole('dialog');
    this.classNameInput = page.getByPlaceholder('e.g. JSS 1');
    this.sectionInput = page.getByPlaceholder('e.g. A');
    this.capacityInput = page.getByPlaceholder('30');
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
  }

  async goto() {
    await this.page.goto('/school-settings');
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
    await this.classesTab.click();
  }

  async expectVisible() {
    await expect(this.addClassButton).toBeVisible({ timeout: 10_000 });
  }

  async expectTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }

  async clickAddClass() {
    await this.addClassButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillClassForm(name: string, section: string, capacity: string) {
    await this.classNameInput.fill(name);
    await this.sectionInput.fill(section);
    await this.capacityInput.fill(capacity);
  }

  async submitForm() {
    const submitButton = this.dialog.getByRole('button', {
      name: /create|update/i,
    });
    // Button is disabled until sessions finish loading (provides sessionId)
    await expect(submitButton).toBeEnabled({ timeout: 10_000 });
    await submitButton.click();
  }

  async expectClassInTable(name: string) {
    await expect(this.dataTable.getByText(name)).toBeVisible({
      timeout: 10_000,
    });
  }

  async editClass(name: string) {
    const row = this.dataTable.locator('tbody tr', { hasText: name });
    // Actions cell is last; first button = edit (pencil), second = delete (trash)
    const actionsCell = row.locator('td').last();
    await actionsCell.locator('button').first().click();
    await expect(this.dialog).toBeVisible();
  }

  async deleteClass(name: string) {
    const row = this.dataTable.locator('tbody tr', { hasText: name });
    // Actions cell is last; second button = delete (trash)
    const actionsCell = row.locator('td').last();
    await actionsCell.locator('button').last().click();
    // Wait for the confirmation dialog and click Delete inside it
    const alertDialog = this.page.locator('[role="alertdialog"]');
    await expect(alertDialog).toBeVisible({ timeout: 3_000 });
    const confirmButton = alertDialog.getByRole('button', { name: /delete/i });
    await confirmButton.click();
    await expect(alertDialog).not.toBeVisible({ timeout: 5_000 });
  }

  async expectClassNotInTable(name: string) {
    await expect(this.dataTable.getByText(name)).not.toBeVisible({
      timeout: 5_000,
    });
  }
}
