import { type Page, type Locator, expect } from '@playwright/test';

export class TeachersPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly inviteTeacherButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Teachers' });
    this.description = page.getByText(
      'Manage teachers in your school.'
    );
    this.inviteTeacherButton = page.getByRole('button', {
      name: /Invite User/i,
    });
  }

  async goto() {
    await this.page.goto('/teachers');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}
