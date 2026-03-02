import { type Page, type Locator, expect } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'My Profile' });
    this.description = page.getByText(
      'View and update your personal information.'
    );
  }

  async goto() {
    await this.page.goto('/profile');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectUserName(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async expectEmail(email: string) {
    await expect(this.page.getByText(email)).toBeVisible();
  }
}
