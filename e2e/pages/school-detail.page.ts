import { type Page, type Locator, expect } from '@playwright/test';

export class SchoolDetailPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly addAdminButton: Locator;
  readonly adminsTable: Locator;
  readonly dialog: Locator;
  readonly alertDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: /back to schools/i });
    this.addAdminButton = page.getByRole('button', { name: /add admin/i });
    this.adminsTable = page.locator('table');
    this.dialog = page.getByRole('dialog');
    this.alertDialog = page.locator('[role="alertdialog"]');
  }

  async goto(schoolId: string) {
    await this.page.goto(`/system/schools/${schoolId}`);
  }

  async expectVisible(schoolName: string) {
    // School name heading may contain the full name (e.g., "Kings Academy Lagos")
    // Use text matching instead of exact heading name match
    await expect(
      this.page.getByRole('heading').filter({ hasText: schoolName })
    ).toBeVisible({ timeout: 30_000 });
  }

  async expectSchoolInfo() {
    await expect(this.page.getByText('School Information')).toBeVisible({ timeout: 15_000 });
  }

  async expectAdminSection() {
    await expect(this.page.getByText('School Administrators')).toBeVisible({ timeout: 15_000 });
  }

  async expectMetricCards() {
    await expect(this.page.getByText('Students')).toBeVisible();
    await expect(this.page.getByText('Teachers')).toBeVisible();
  }

  async clickAddAdmin() {
    await this.addAdminButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillCreateAdminForm(
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

  async fillEditAdminForm(firstName: string, lastName: string) {
    await this.dialog.locator('#edit-firstName').fill(firstName);
    await this.dialog.locator('#edit-lastName').fill(lastName);
  }

  async submitCreate() {
    const btn = this.dialog.getByRole('button', { name: /create admin/i });
    await btn.click();
  }

  async submitEdit() {
    const btn = this.dialog.getByRole('button', { name: /update admin/i });
    await btn.click();
  }

  async cancelDialog() {
    await this.dialog.getByRole('button', { name: /cancel/i }).click();
  }

  async expectAdminInTable(text: string) {
    await expect(this.adminsTable.getByText(text)).toBeVisible({
      timeout: 10_000,
    });
  }

  async expectAdminNotInTable(text: string) {
    await expect(this.adminsTable.getByText(text)).not.toBeVisible({
      timeout: 5_000,
    });
  }

  getAdminRowByEmail(email: string) {
    return this.adminsTable.locator('tbody tr', { hasText: email });
  }

  async clickEditAdmin(email: string) {
    const row = this.getAdminRowByEmail(email);
    await row.getByTitle('Edit admin').click();
    await expect(this.dialog).toBeVisible();
  }

  async clickDeactivateAdmin(email: string) {
    const row = this.getAdminRowByEmail(email);
    await row.getByTitle('Deactivate admin').click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async clickActivateAdmin(email: string) {
    const row = this.getAdminRowByEmail(email);
    await row.getByTitle('Activate admin').click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async clickDeleteAdmin(email: string) {
    const row = this.getAdminRowByEmail(email);
    await row.getByTitle('Remove admin role').click();
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
