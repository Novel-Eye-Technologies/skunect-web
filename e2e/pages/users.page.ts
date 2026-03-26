import { type Page, type Locator, expect } from '@playwright/test';

export class UsersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly inviteButton: Locator;
  readonly dataTable: Locator;
  readonly dialog: Locator;
  readonly alertDialog: Locator;

  // Filter selects
  readonly roleFilter: Locator;
  readonly statusFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'User Management' });
    this.inviteButton = page.getByRole('button', { name: 'Invite User' });
    this.dataTable = page.locator('table');
    this.dialog = page.getByRole('dialog');
    this.alertDialog = page.locator('[role="alertdialog"]');

    // The role filter is the first select, status is the second
    this.roleFilter = page.getByRole('combobox').first();
    this.statusFilter = page.getByRole('combobox').last();
  }

  async goto() {
    await this.page.goto('/users');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }

  async expectUserInTable(text: string) {
    await expect(this.dataTable.getByText(text)).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectUserNotInTable(text: string) {
    await expect(this.dataTable.getByText(text)).not.toBeVisible({
      timeout: 5_000,
    });
  }

  getRowByName(name: string) {
    return this.dataTable.locator('tbody tr', { hasText: name });
  }

  async findRowByNameAcrossPages(name: string, maxPageHops = 10) {
    const nextPageButton = this.page.getByRole('button', {
      name: /go to next page/i,
    });

    for (let hop = 0; hop <= maxPageHops; hop++) {
      const row = this.getRowByName(name).first();
      if ((await row.count()) > 0) {
        await expect(row).toBeVisible({ timeout: 10_000 });
        return row;
      }

      if (await nextPageButton.isDisabled()) {
        break;
      }

      await nextPageButton.click();
      await expect(this.dataTable.locator('tbody tr').first()).toBeVisible({
        timeout: 10_000,
      });
    }

    throw new Error(
      `Could not find user row for "${name}" after checking multiple pages.`
    );
  }

  async openActionsMenu(name: string) {
    const row = await this.findRowByNameAcrossPages(name);
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

  async clickRemoveUser(name: string) {
    await this.openActionsMenu(name);
    await this.page.getByRole('menuitem', { name: /remove user/i }).click();
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

  // Edit user dialog helpers
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
}
