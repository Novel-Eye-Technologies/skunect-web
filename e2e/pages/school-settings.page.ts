import { type Page, type Locator, expect } from '@playwright/test';

export class SchoolSettingsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly generalTab: Locator;
  readonly sessionsTab: Locator;
  readonly classesTab: Locator;
  readonly subjectsTab: Locator;
  readonly gradingTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'School Settings' });
    this.generalTab = page.getByRole('tab', { name: 'General' });
    this.sessionsTab = page.getByRole('tab', { name: 'Sessions & Terms' });
    this.classesTab = page.getByRole('tab', { name: 'Classes' });
    this.subjectsTab = page.getByRole('tab', { name: 'Subjects' });
    this.gradingTab = page.getByRole('tab', { name: 'Grading' });
  }

  async goto() {
    await this.page.goto('/school-settings');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}
