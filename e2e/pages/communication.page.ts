import { type Page, type Locator, expect } from '@playwright/test';

export class MessagesPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Messages' });
    this.description = page.getByText(
      'Send and receive messages with staff and parents.'
    );
  }

  async goto() {
    await this.page.goto('/communication/messages');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}

export class AnnouncementsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Announcements' });
    this.description = page.getByText(
      'Create and manage school-wide announcements.'
    );
    this.createButton = page.getByRole('button', {
      name: 'Create Announcement',
    });
  }

  async goto() {
    await this.page.goto('/communication/announcements');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}

/**
 * There is no standalone notifications page.
 * Notifications are part of the communication section.
 * This page object navigates to /communication and checks
 * that the communication section is accessible.
 */
export class NotificationsPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    // There is no dedicated "Notifications" heading/page.
    // Navigate to the communication section instead.
    this.heading = page.getByRole('heading', { name: /messages|announcements/i });
  }

  async goto() {
    // No standalone notifications route; go to communication section
    await this.page.goto('/communication/messages');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}
