import { type Page, type Locator, expect } from '@playwright/test';

/**
 * POM for the Super Admin school subscription management page:
 * /system/schools/[schoolId]/subscription
 */
export class SchoolSubscriptionPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly dialog: Locator;
  readonly alertDialog: Locator;

  // Action buttons
  readonly createSubscriptionButton: Locator;
  readonly recordPaymentButton: Locator;
  readonly prorationCalculatorButton: Locator;
  readonly cancelSubscriptionButton: Locator;

  // Stats
  readonly statusCard: Locator;
  readonly studentsCard: Locator;

  // Tables / cards
  readonly subscriptionDetailsCard: Locator;
  readonly paymentHistoryTable: Locator;
  readonly studentUsageCard: Locator;

  // No-subscription state
  readonly noSubscriptionMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'School Subscription' });
    this.dialog = page.getByRole('dialog');
    this.alertDialog = page.locator('[role="alertdialog"]');

    this.createSubscriptionButton = page.getByRole('button', { name: /create subscription/i });
    this.recordPaymentButton = page.getByRole('button', { name: /record payment/i });
    this.prorationCalculatorButton = page.getByRole('button', { name: /proration calculator/i });
    this.cancelSubscriptionButton = page.getByRole('button', { name: /cancel subscription/i });

    this.statusCard = page.getByText('Status').locator('..');
    this.studentsCard = page.getByText('Students').locator('..');
    this.subscriptionDetailsCard = page.locator('text=Subscription Details').locator('..');
    this.paymentHistoryTable = page.locator('table');
    this.studentUsageCard = page.getByText('Student Usage').locator('..');
    this.noSubscriptionMessage = page.getByText('No active subscription for this school');
  }

  async goto(schoolId: string) {
    await this.page.goto(`/system/schools/${schoolId}/subscription`);
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectNoSubscription() {
    await expect(this.noSubscriptionMessage).toBeVisible({ timeout: 10_000 });
  }

  async expectHasSubscription() {
    await expect(this.page.getByText('Subscription Details')).toBeVisible({ timeout: 10_000 });
  }

  async expectStatusText(status: string) {
    await expect(this.page.getByText(status)).toBeVisible({ timeout: 10_000 });
  }

  // --- Create Subscription Dialog ---
  async openCreateDialog() {
    await this.createSubscriptionButton.first().click();
    await expect(this.dialog).toBeVisible();
  }

  async fillCreateForm(opts: {
    planName: string;
    startDate: string;
    endDate: string;
    studentLimit: number;
  }) {
    // Select plan from dropdown
    const planTrigger = this.dialog.getByRole('combobox').first();
    await planTrigger.click();
    await this.page.getByRole('option', { name: new RegExp(opts.planName) }).click();

    // Fill dates
    const dateInputs = this.dialog.locator('input[type="date"]');
    await dateInputs.first().fill(opts.startDate);
    await dateInputs.nth(1).fill(opts.endDate);

    // Fill student limit
    await this.dialog.locator('input[type="number"]').fill(opts.studentLimit.toString());
  }

  async submitCreateForm() {
    const btn = this.dialog.getByRole('button', { name: /^create$/i });
    await btn.click();
  }

  // --- Record Payment Dialog ---
  async openPaymentDialog() {
    await this.recordPaymentButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillPaymentForm(opts: {
    amount: number;
    paymentType: string;
    paymentMethod: string;
    paymentReference?: string;
    description?: string;
  }) {
    // Amount
    await this.dialog.locator('input[type="number"]').first().fill(opts.amount.toString());

    // Select payment type
    const typeCombobox = this.dialog.getByRole('combobox').first();
    await typeCombobox.click();
    await this.page.getByRole('option', { name: opts.paymentType }).click();

    // Select payment method
    const methodCombobox = this.dialog.getByRole('combobox').nth(1);
    await methodCombobox.click();
    await this.page.getByRole('option', { name: new RegExp(opts.paymentMethod.replace('_', ' '), 'i') }).click();

    if (opts.paymentReference) {
      await this.dialog.locator('input[placeholder*="TXN"]').fill(opts.paymentReference);
    }

    if (opts.description) {
      await this.dialog.locator('textarea').fill(opts.description);
    }
  }

  async submitPaymentForm() {
    const btn = this.dialog.getByRole('button', { name: /record payment/i });
    await btn.click();
  }

  // --- Proration Calculator ---
  async openProrationDialog() {
    await this.prorationCalculatorButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillAdditionalStudents(count: number) {
    await this.dialog.locator('input[type="number"]').fill(count.toString());
  }

  async clickCalculate() {
    await this.dialog.getByRole('button', { name: /calculate/i }).click();
  }

  async expectProrationResult() {
    await expect(this.dialog.getByText('Prorated Amount')).toBeVisible({ timeout: 10_000 });
  }

  // --- Cancel ---
  async clickCancelSubscription() {
    await this.cancelSubscriptionButton.click();
    await expect(this.alertDialog).toBeVisible({ timeout: 3_000 });
  }

  async confirmCancel() {
    const btn = this.alertDialog.getByRole('button', { name: /cancel subscription/i });
    await btn.click();
    await expect(this.alertDialog).not.toBeVisible({ timeout: 5_000 });
  }

  // --- Payment History ---
  async expectPaymentInTable(reference: string) {
    await expect(this.paymentHistoryTable.getByText(reference)).toBeVisible({ timeout: 10_000 });
  }

  async expectGracePeriodWarning() {
    await expect(this.page.getByText('Grace Period Active')).toBeVisible({ timeout: 10_000 });
  }
}
