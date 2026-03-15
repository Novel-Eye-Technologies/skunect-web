import { type Page, type Locator, expect } from '@playwright/test';

/**
 * POM for the School Admin subscription page: /subscription
 */
export class AdminSubscriptionPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly dialog: Locator;

  // Action buttons
  readonly prorationCalculatorButton: Locator;
  readonly requestUpgradeButton: Locator;

  // Stats
  readonly statusCard: Locator;
  readonly studentsCard: Locator;

  // Content
  readonly subscriptionDetailsCard: Locator;
  readonly paymentHistoryTable: Locator;
  readonly studentUsageCard: Locator;
  readonly noSubscriptionMessage: Locator;
  readonly gracePeriodWarning: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Subscription' });
    this.dialog = page.getByRole('dialog');

    this.prorationCalculatorButton = page.getByRole('button', { name: /proration calculator/i });
    this.requestUpgradeButton = page.getByRole('button', { name: /request upgrade/i });

    this.statusCard = page.getByText('Status').locator('..');
    this.studentsCard = page.getByText('Students').locator('..');
    this.subscriptionDetailsCard = page.locator('text=Subscription Details').locator('..');
    this.paymentHistoryTable = page.locator('table');
    this.studentUsageCard = page.getByText('Student Usage').locator('..');
    this.noSubscriptionMessage = page.getByText('No active subscription found for your school');
    this.gracePeriodWarning = page.getByText('Subscription Grace Period');
  }

  async goto() {
    await this.page.goto('/subscription');
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

  async expectGracePeriodWarning() {
    await expect(this.gracePeriodWarning).toBeVisible({ timeout: 10_000 });
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

  async closeDialog() {
    await this.page.keyboard.press('Escape');
    await expect(this.dialog).not.toBeVisible({ timeout: 3_000 });
  }

  // --- Upgrade Request ---
  async openUpgradeDialog() {
    await this.requestUpgradeButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillUpgradeForm(opts: { students?: number; message: string }) {
    if (opts.students !== undefined) {
      await this.dialog.locator('input[type="number"]').fill(opts.students.toString());
    }
    await this.dialog.locator('textarea').fill(opts.message);
  }

  async submitUpgradeRequest() {
    await this.dialog.getByRole('button', { name: /submit request/i }).click();
  }

  // --- Payment History ---
  async expectPaymentInTable(text: string) {
    await expect(this.paymentHistoryTable.getByText(text)).toBeVisible({ timeout: 10_000 });
  }
}
