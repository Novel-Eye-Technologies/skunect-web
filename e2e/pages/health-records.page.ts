import { type Page, type Locator, expect } from '@playwright/test';

export class HealthRecordsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly addRecordButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Health Records' });
    this.description = page.getByText(
      'Track student health information, allergies, and medical records.'
    );
    this.addRecordButton = page.getByRole('button', {
      name: /Add Record/i,
    });
  }

  async goto() {
    await this.page.goto('/welfare/health-records');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async openAddRecordDialog() {
    await this.addRecordButton.click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    return dialog;
  }
}
