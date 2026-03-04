import { type Page, type Locator, expect } from '@playwright/test';

export class ActivityFeedPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly activityList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Activity Feed' });
    this.description = page.getByText(
      'Recent activity across the school.'
    );
    this.activityList = page.locator('[data-slot="card-title"]', {
      hasText: 'Recent Activity',
    });
  }

  async goto() {
    await this.page.goto('/activity');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}
