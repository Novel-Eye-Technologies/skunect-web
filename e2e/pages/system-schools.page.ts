import { type Page, type Locator, expect } from '@playwright/test';

export class SystemSchoolsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly addButton: Locator;
  readonly dataTable: Locator;
  readonly dialog: Locator;
  readonly alertDialog: Locator;

  // School form fields
  readonly schoolNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'All Schools' });
    this.description = page.getByText(
      'Manage all registered schools across the platform'
    );
    this.addButton = page.getByRole('button', { name: 'Add School', exact: true });
    this.dataTable = page.locator('table');
    this.dialog = page.getByRole('dialog');
    this.alertDialog = page.locator('[role="alertdialog"]');

    this.schoolNameInput = page.locator('#school-name');
    this.emailInput = page.locator('#school-email');
    this.phoneInput = page.locator('#school-phone');
    this.addressInput = page.locator('#school-address');
    this.cityInput = page.locator('#school-city');
  }

  async goto() {
    await this.page.goto('/system/schools');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectSchoolInTable(schoolName: string) {
    await expect(this.dataTable.getByText(schoolName)).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectSchoolNotInTable(schoolName: string) {
    await expect(this.dataTable.getByText(schoolName)).not.toBeVisible({
      timeout: 5_000,
    });
  }

  async clickAdd() {
    await this.addButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillSchoolForm(name: string, tier: 'STANDARD' | 'PREMIUM') {
    await this.schoolNameInput.fill(name);
    // Select subscription tier — first combobox in dialog is the tier select
    // (second is the state combobox)
    const trigger = this.dialog.getByRole('combobox').first();
    await trigger.click();
    const tierLabel = tier === 'STANDARD' ? 'Standard' : 'Premium';
    await this.page.getByRole('option', { name: tierLabel }).click();
  }

  async submitSchoolForm() {
    const btn = this.dialog.getByRole('button', {
      name: /create school|update school/i,
    });
    await btn.click();
  }

  async cancelDialog() {
    await this.dialog.getByRole('button', { name: /cancel/i }).click();
  }

  getRowBySchoolName(name: string) {
    return this.dataTable.locator('tbody tr', { hasText: name });
  }

  async clickEditSchool(name: string) {
    const row = this.getRowBySchoolName(name);
    await row.getByTitle('Edit school').click();
    await expect(this.dialog).toBeVisible();
  }

  async clickDeactivateSchool(name: string) {
    const row = this.getRowBySchoolName(name);
    await row.getByTitle('Deactivate school').click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async clickActivateSchool(name: string) {
    const row = this.getRowBySchoolName(name);
    await row.getByTitle('Activate school').click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async clickDeleteSchool(name: string) {
    const row = this.getRowBySchoolName(name);
    await row.getByTitle('Delete school').click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async clickCreateAdmin(name: string) {
    const row = this.getRowBySchoolName(name);
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.getByTitle('Add school admin').click();
    await expect(this.dialog).toBeVisible();
  }

  async fillAdminForm(
    firstName: string,
    lastName: string,
    email: string,
    phone?: string
  ) {
    await this.dialog.locator('#admin-firstName').fill(firstName);
    await this.dialog.locator('#admin-lastName').fill(lastName);
    await this.dialog.locator('#admin-email').fill(email);
    if (phone) {
      await this.dialog.locator('#admin-phone').fill(phone);
    }
  }

  async submitAdminForm() {
    const btn = this.dialog.getByRole('button', { name: /create admin/i });
    await expect(btn).toBeEnabled({ timeout: 5_000 });
    await btn.click();
    // Wait for API response — button may briefly disable during submission
    await this.page.waitForTimeout(500);
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
