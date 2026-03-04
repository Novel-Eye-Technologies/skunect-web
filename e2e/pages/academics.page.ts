import { type Page, type Locator, expect } from '@playwright/test';

export class AcademicsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly assessmentsTab: Locator;
  readonly gradeEntryTab: Locator;
  readonly reportCardsTab: Locator;
  readonly createAssessmentButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Academics' });
    this.description = page.getByText(
      'Manage assessments, grades, and report cards.'
    );
    this.assessmentsTab = page.getByRole('tab', { name: 'Assessments' });
    this.gradeEntryTab = page.getByRole('tab', { name: 'Grade Entry' });
    this.reportCardsTab = page.getByRole('tab', { name: 'Report Cards' });
    this.createAssessmentButton = page.getByRole('button', {
      name: 'Create Assessment',
    });
  }

  async goto() {
    await this.page.goto('/academics');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }
}
