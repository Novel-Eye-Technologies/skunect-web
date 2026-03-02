import { type Page, type Locator, expect } from '@playwright/test';

export class FeesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly feeStructuresTab: Locator;
  readonly invoicesTab: Locator;
  readonly createStructureButton: Locator;
  readonly generateInvoicesButton: Locator;
  readonly dataTable: Locator;

  constructor(page: Page) {
    this.page = page;
    // PageHeader renders title as <h1>
    this.heading = page.getByRole('heading', { name: /fees management/i });
    this.description = page.getByText(
      'Manage fee structures, invoices, and payments.'
    );
    // Tab triggers include icons before text, so use regex for flexibility
    this.feeStructuresTab = page.getByRole('tab', { name: /fee structures/i });
    this.invoicesTab = page.getByRole('tab', { name: /invoices/i });
    this.createStructureButton = page.getByRole('button', {
      name: /create structure/i,
    });
    this.generateInvoicesButton = page.getByRole('button', {
      name: /generate invoices/i,
    });
    this.dataTable = page.locator('table');
  }

  async goto() {
    await this.page.goto('/fees');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async switchToFeeStructures() {
    await this.feeStructuresTab.click();
  }

  async switchToInvoices() {
    await this.invoicesTab.click();
  }
}
