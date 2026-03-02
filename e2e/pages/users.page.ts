import { type Page, type Locator, expect } from '@playwright/test';

export class UsersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly inviteButton: Locator;
  readonly dataTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'User Management' });
    this.inviteButton = page.getByRole('button', { name: 'Invite User' });
    this.dataTable = page.locator('table');
  }

  async goto() {
    await this.page.goto('/users');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }
}
