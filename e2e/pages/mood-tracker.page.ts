import { type Page, type Locator, expect } from '@playwright/test';

export class MoodTrackerPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly logMoodButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Mood Tracker' });
    this.description = page.getByText(
      'Track and monitor student emotional well-being.'
    );
    this.logMoodButton = page.getByRole('button', { name: /Log Mood/i });
  }

  async goto() {
    await this.page.goto('/welfare/mood');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async openLogMoodDialog() {
    await this.logMoodButton.click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    return dialog;
  }
}
