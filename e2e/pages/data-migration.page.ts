import { type Page, type Locator, expect } from '@playwright/test';

export class DataMigrationPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly uploadTab: Locator;
  readonly historyTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Data Migration' });
    this.description = page.getByText(
      'Import data from CSV files into the system.'
    );
    this.uploadTab = page.getByRole('tab', { name: 'Upload' });
    this.historyTab = page.getByRole('tab', { name: 'History' });
  }

  async goto() {
    await this.page.goto('/data-migration');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}
