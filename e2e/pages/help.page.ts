import { type Page, type Locator, expect } from '@playwright/test';

export class HelpPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly gettingStartedSection: Locator;
  readonly contactSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Help & Support' });
    this.description = page.getByText(
      'Find answers to common questions and get support.'
    );
    this.gettingStartedSection = page.locator('[data-slot="card-title"]', {
      hasText: 'Getting Started',
    });
    this.contactSection = page.locator('[data-slot="card-title"]', {
      hasText: 'Contact Support',
    });
  }

  async goto() {
    await this.page.goto('/help');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectFaqSections() {
    await expect(this.gettingStartedSection).toBeVisible();
    await expect(this.contactSection).toBeVisible();
  }
}
