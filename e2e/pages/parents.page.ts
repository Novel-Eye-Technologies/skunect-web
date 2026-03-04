import { type Page, type Locator, expect } from '@playwright/test';

export class ParentsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Parents' });
    this.description = page.getByText(
      'Manage parent accounts linked to your school.'
    );
  }

  async goto() {
    await this.page.goto('/parents');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}
