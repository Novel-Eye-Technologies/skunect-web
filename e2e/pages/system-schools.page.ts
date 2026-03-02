import { type Page, type Locator, expect } from '@playwright/test';

export class SystemSchoolsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly dataTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'All Schools' });
    this.description = page.getByText(
      'Manage all registered schools across the platform'
    );
    this.dataTable = page.locator('table');
  }

  async goto() {
    await this.page.goto('/system/schools');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectSchoolInTable(schoolName: string) {
    await expect(this.dataTable.getByText(schoolName)).toBeVisible();
  }
}
