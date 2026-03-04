import { type Page, type Locator, expect } from '@playwright/test';

export class MyClassesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'My Classes' });
    this.description = page.getByText(
      'View and manage your assigned classes.'
    );
  }

  async goto() {
    await this.page.goto('/my-classes');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}
