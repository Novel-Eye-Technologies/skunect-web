import { type Page, type Locator, expect } from '@playwright/test';

export class SubscriptionPlansPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly createButton: Locator;
  readonly dataTable: Locator;
  readonly dialog: Locator;
  readonly alertDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Subscription Plans' });
    this.description = page.getByText('Manage subscription plans for schools');
    this.createButton = page.getByRole('button', { name: /create plan/i });
    this.dataTable = page.locator('table');
    this.dialog = page.getByRole('dialog');
    this.alertDialog = page.locator('[role="alertdialog"]');
  }

  async goto() {
    await this.page.goto('/system/subscription-plans');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async clickCreate() {
    await this.createButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillPlanForm(opts: {
    name: string;
    tier: 'STANDARD' | 'PREMIUM';
    pricePerStudent: number;
    billingPeriodMonths?: number;
    maxStudents?: number;
    isTrial?: boolean;
    trialDurationDays?: number;
  }) {
    await this.dialog.locator('#name').fill(opts.name);

    // Select tier
    const tierTrigger = this.dialog.getByRole('combobox').first();
    await tierTrigger.click();
    const tierLabel = opts.tier === 'STANDARD' ? 'Standard' : 'Premium';
    await this.page.getByRole('option', { name: tierLabel }).click();

    await this.dialog.locator('#price').fill(opts.pricePerStudent.toString());

    if (opts.billingPeriodMonths !== undefined) {
      await this.dialog.locator('#billing').fill(opts.billingPeriodMonths.toString());
    }

    if (opts.maxStudents !== undefined) {
      await this.dialog.locator('#maxStudents').fill(opts.maxStudents.toString());
    }

    if (opts.isTrial) {
      const checkbox = this.dialog.locator('input[type="checkbox"]');
      await checkbox.check();
      if (opts.trialDurationDays !== undefined) {
        await this.dialog.locator('#trialDays').fill(opts.trialDurationDays.toString());
      }
    }
  }

  async submitForm() {
    const btn = this.dialog.getByRole('button', { name: /create|update/i }).last();
    await btn.click();
  }

  async expectPlanInTable(planName: string) {
    await expect(this.dataTable.getByText(planName)).toBeVisible({ timeout: 10_000 });
  }

  async expectPlanNotInTable(planName: string) {
    await expect(this.dataTable.getByText(planName)).not.toBeVisible({ timeout: 5_000 });
  }

  getRowByPlanName(name: string) {
    return this.dataTable.locator('tbody tr', { hasText: name });
  }

  async clickEditPlan(name: string) {
    const row = this.getRowByPlanName(name);
    await row.getByRole('button').first().click();
    await expect(this.dialog).toBeVisible();
  }

  async clickDeactivatePlan(name: string) {
    const row = this.getRowByPlanName(name);
    // The deactivate button is the second icon button (Ban icon)
    await row.getByRole('button').nth(1).click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async confirmAlert(buttonName: RegExp) {
    const btn = this.alertDialog.getByRole('button', { name: buttonName });
    await btn.click();
    await expect(this.alertDialog).not.toBeVisible({ timeout: 5_000 });
  }
}
