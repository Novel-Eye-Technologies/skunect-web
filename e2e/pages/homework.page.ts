import { type Page, type Locator, expect } from '@playwright/test';

export class HomeworkPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly createButton: Locator;
  readonly dataTable: Locator;

  constructor(page: Page) {
    this.page = page;
    // PageHeader renders title as <h1>
    this.heading = page.getByRole('heading', { name: /homework/i });
    this.description = page.getByText(
      'Manage homework assignments and submissions.'
    );
    this.createButton = page.getByRole('button', {
      name: /create assignment/i,
    });
    this.dataTable = page.locator('table');
  }

  async goto() {
    await this.page.goto('/homework');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async expectTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }
}
