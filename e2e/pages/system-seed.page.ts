import { type Page, type Locator, expect } from '@playwright/test';

export class SystemSeedPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly resetButton: Locator;
  readonly confirmResetButton: Locator;
  readonly cancelButton: Locator;
  readonly testAccountsCard: Locator;

  constructor(page: Page) {
    this.page = page;
    // The PageHeader renders title as <h1>
    this.heading = page.getByRole('heading', { name: /seed data management/i });
    this.description = page.getByText(
      'Reset the database with fresh test data for all test scenarios'
    );
    this.resetButton = page.getByRole('button', { name: /reset seed data/i });
    this.confirmResetButton = page.getByRole('button', {
      name: /yes, reset everything/i,
    });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    // The "Test Accounts" CardTitle is a div; use a broader locator
    this.testAccountsCard = page.locator('[data-slot="card-title"]').filter({ hasText: 'Test Accounts' });
  }

  async goto() {
    await this.page.goto('/system/seed');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async expectTestAccountsVisible() {
    await expect(this.testAccountsCard).toBeVisible({ timeout: 10_000 });
  }
}
