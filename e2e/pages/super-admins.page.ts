import { type Page, type Locator, expect } from '@playwright/test';

export class SuperAdminsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly addButton: Locator;
  readonly dataTable: Locator;
  readonly dialog: Locator;
  readonly alertDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Super Admins' });
    this.description = page.getByText('Manage platform-level administrators');
    this.addButton = page.getByRole('button', { name: /add super admin/i });
    this.dataTable = page.locator('table');
    this.dialog = page.getByRole('dialog');
    this.alertDialog = page.locator('[role="alertdialog"]');
  }

  async goto() {
    await this.page.goto('/system/super-admins');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }

  async clickAdd() {
    await this.addButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillCreateForm(
    firstName: string,
    lastName: string,
    email: string,
    phone?: string
  ) {
    await this.dialog.locator('#create-firstName').fill(firstName);
    await this.dialog.locator('#create-lastName').fill(lastName);
    await this.dialog.locator('#create-email').fill(email);
    if (phone) {
      await this.dialog.locator('#create-phone').fill(phone);
    }
  }

  async fillEditForm(firstName: string, lastName: string) {
    await this.dialog.locator('#edit-firstName').fill(firstName);
    await this.dialog.locator('#edit-lastName').fill(lastName);
  }

  async submitCreate() {
    const btn = this.dialog.getByRole('button', {
      name: /create super admin/i,
    });
    await btn.click();
  }

  async submitEdit() {
    const btn = this.dialog.getByRole('button', { name: /^update$/i });
    await btn.click();
  }

  async cancelDialog() {
    await this.dialog.getByRole('button', { name: /cancel/i }).click();
  }

  async expectAdminInTable(text: string) {
    await expect(this.dataTable.getByText(text)).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectAdminNotInTable(text: string) {
    await expect(this.dataTable.getByText(text)).not.toBeVisible({
      timeout: 5_000,
    });
  }

  getRowByEmail(email: string) {
    return this.dataTable.locator('tbody tr', { hasText: email });
  }

  async clickEditOnRow(email: string) {
    const row = this.getRowByEmail(email);
    await row.getByTitle('Edit name').click();
    await expect(this.dialog).toBeVisible();
  }

  async clickDeactivateOnRow(email: string) {
    const row = this.getRowByEmail(email);
    await row.getByTitle('Deactivate').click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async clickActivateOnRow(email: string) {
    const row = this.getRowByEmail(email);
    await row.getByTitle('Activate').click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async clickDeleteOnRow(email: string) {
    const row = this.getRowByEmail(email);
    await row.getByTitle('Remove super admin role').click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async confirmAlert(buttonName: RegExp) {
    const btn = this.alertDialog.getByRole('button', { name: buttonName });
    await btn.click();
    await expect(this.alertDialog).not.toBeVisible({ timeout: 5_000 });
  }

  async cancelAlert() {
    await this.alertDialog.getByRole('button', { name: /cancel/i }).click();
    await expect(this.alertDialog).not.toBeVisible({ timeout: 3_000 });
  }
}
