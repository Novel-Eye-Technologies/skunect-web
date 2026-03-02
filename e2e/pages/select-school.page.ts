import { type Page, type Locator, expect } from '@playwright/test';

export class SelectSchoolPage {
  readonly page: Page;

  // Elements
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // h2 "Select a school"
    this.heading = page.getByRole('heading', { name: /select a school/i });

    // p "You have access to multiple schools. Choose which one to use."
    this.subtitle = page.getByText(
      'You have access to multiple schools. Choose which one to use.'
    );

    // Continue button (disabled until a school is selected)
    this.continueButton = page.getByRole('button', { name: /continue/i });
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Get all school card buttons.
   * Each card is a Card (div) with role="button" and aria-pressed attribute.
   */
  getSchoolCards(): Locator {
    return this.page.locator('[role="button"][aria-pressed]');
  }

  /** Click a school card by matching the school name text inside it. */
  async selectSchool(schoolName: string) {
    const card = this.page
      .locator('[role="button"][aria-pressed]')
      .filter({ hasText: schoolName });
    await card.waitFor({ state: 'visible', timeout: 10_000 });
    await card.click();
  }

  async continue() {
    await this.continueButton.click();
  }

  /** Select a school and click Continue. */
  async selectAndContinue(schoolName: string) {
    await this.selectSchool(schoolName);
    await this.continue();
  }

  /** Assert that a school card with the given name is visible. */
  async expectSchoolVisible(schoolName: string) {
    await expect(
      this.page
        .locator('[role="button"][aria-pressed]')
        .filter({ hasText: schoolName })
    ).toBeVisible({ timeout: 10_000 });
  }

  /** Assert that at least 2 school options are visible. */
  async expectMultipleSchools() {
    // Wait for at least one card to be visible first
    const cards = this.getSchoolCards();
    await cards.first().waitFor({ state: 'visible', timeout: 10_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);
  }
}
