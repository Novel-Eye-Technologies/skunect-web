import { type Page, type Locator, expect } from '@playwright/test';

export class NotificationPreferencesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly notificationChannelsCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', {
      name: 'Notification Preferences',
    });
    this.description = page.getByText(
      'Choose how you want to be notified for different events.'
    );
    this.notificationChannelsCard = page.locator('[data-slot="card-title"]', {
      hasText: 'Notification Channels',
    });
  }

  async goto() {
    await this.page.goto('/notification-preferences');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}
