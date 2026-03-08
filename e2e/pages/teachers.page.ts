import { type Page, type Locator, expect } from '@playwright/test';

export class TeachersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly inviteTeacherButton: Locator;
  readonly dataTable: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly dialog: Locator;
  readonly alertDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Teachers' });
    this.description = page.getByText('Manage teachers in your school.');
    this.inviteTeacherButton = page.getByRole('button', {
      name: /Add Teacher/i,
    });
    this.dataTable = page.locator('table');
    this.searchInput = page.getByPlaceholder('Search teachers...');
    this.statusFilter = page.getByRole('combobox');
    this.dialog = page.getByRole('dialog');
    this.alertDialog = page.locator('[role="alertdialog"]');
  }

  async goto() {
    await this.page.goto('/teachers');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }

  async expectTeacherInTable(text: string) {
    await expect(this.dataTable.getByText(text)).toBeVisible({
      timeout: 10_000,
    });
  }

  getRowByName(name: string) {
    return this.dataTable.locator('tbody tr', { hasText: name });
  }

  async openActionsMenu(name: string) {
    const row = this.getRowByName(name);
    await row.getByRole('button', { name: /open menu/i }).click();
  }

  async clickEditDetails(name: string) {
    await this.openActionsMenu(name);
    await this.page.getByRole('menuitem', { name: /edit details/i }).click();
    await expect(this.dialog).toBeVisible();
  }

  async clickChangeStatus(name: string) {
    await this.openActionsMenu(name);
    await this.page.getByRole('menuitem', { name: /change status/i }).click();
    await expect(this.dialog).toBeVisible();
  }

  async clickRemoveTeacher(name: string) {
    await this.openActionsMenu(name);
    await this.page
      .getByRole('menuitem', { name: /remove teacher/i })
      .click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async confirmRemove() {
    const btn = this.alertDialog.getByRole('button', { name: /remove/i });
    await btn.click();
    await expect(this.alertDialog).not.toBeVisible({ timeout: 5_000 });
  }

  async cancelRemove() {
    await this.alertDialog.getByRole('button', { name: /cancel/i }).click();
    await expect(this.alertDialog).not.toBeVisible({ timeout: 3_000 });
  }

  // Edit dialog helpers
  async fillEditForm(firstName: string, lastName: string, phone?: string) {
    const firstNameInput = this.dialog.getByLabel('First Name');
    const lastNameInput = this.dialog.getByLabel('Last Name');
    await firstNameInput.fill(firstName);
    await lastNameInput.fill(lastName);
    if (phone !== undefined) {
      const phoneInput = this.dialog.getByLabel('Phone');
      await phoneInput.fill(phone);
    }
  }

  async submitEdit() {
    const btn = this.dialog.getByRole('button', { name: /save changes/i });
    await btn.click();
  }

  async cancelDialog() {
    await this.dialog.getByRole('button', { name: /cancel/i }).click();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }
}
