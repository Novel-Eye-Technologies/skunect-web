import { type Page, type Locator, expect } from '@playwright/test';

/**
 * POM for the school-inactive page shown to teachers/parents
 * when their school's subscription is inactive.
 */
export class SchoolInactivePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'School Subscription Inactive' });
    this.description = page.getByText('subscription is currently inactive');
  }

  async goto() {
    await this.page.goto('/school-inactive');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectContactMessage() {
    await expect(
      this.page.getByText('contact your school administrator')
    ).toBeVisible({ timeout: 10_000 });
  }
}
