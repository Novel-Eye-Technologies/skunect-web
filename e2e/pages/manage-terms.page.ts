import { type Page, type Locator, expect } from '@playwright/test';

export class ManageTermsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly sessionsTab: Locator;
  readonly dialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'School Settings' });
    this.sessionsTab = page.getByRole('tab', { name: 'Sessions & Terms' });
    this.dialog = page.getByRole('dialog');
  }

  async goto() {
    await this.page.goto('/school-settings');
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
    await this.sessionsTab.click();
  }

  async expectVisible() {
    await expect(
      this.page.getByText('Academic Sessions')
    ).toBeVisible({ timeout: 10_000 });
  }

  // --- Session methods ---

  async clickAddSession() {
    // Click the "Add" button in the sessions panel
    const sessionsPanel = this.page.getByText('Academic Sessions').locator('..');
    await sessionsPanel.getByRole('button', { name: /add/i }).click();
    await expect(this.dialog).toBeVisible();
  }

  async fillSessionForm(name: string, startDate: string, endDate: string) {
    await this.page.getByPlaceholder('e.g. 2024/2025').fill(name);
    const dateInputs = this.dialog.locator('input[type="date"]');
    await dateInputs.first().fill(startDate);
    await dateInputs.last().fill(endDate);
  }

  async submitForm() {
    const submitButton = this.dialog.getByRole('button', {
      name: /create|update/i,
    });
    await submitButton.click();
  }

  async expectSessionVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible({ timeout: 10_000 });
  }

  async selectSession(name: string) {
    await this.page.getByText(name).click();
  }

  async editSession(name: string) {
    const sessionItem = this.page.locator('[class*="cursor-pointer"]', {
      hasText: name,
    });
    // Click the edit (pencil) icon button
    await sessionItem.getByRole('button').nth(1).click();
    await expect(this.dialog).toBeVisible();
  }

  async deleteSession(name: string) {
    const sessionItem = this.page.locator('[class*="cursor-pointer"]', {
      hasText: name,
    });
    // Click the delete (trash) icon button
    await sessionItem.getByRole('button').last().click();
    const confirmButton = this.page.getByRole('button', { name: /delete/i });
    await confirmButton.click();
  }

  // --- Term methods ---

  async clickAddTerm() {
    const termsPanel = this.page.getByText(/^Terms/).locator('..');
    await termsPanel.getByRole('button', { name: /add/i }).click();
    await expect(this.dialog).toBeVisible();
  }

  async fillTermForm(name: string, startDate: string, endDate: string) {
    await this.page.getByPlaceholder('e.g. First Term').fill(name);
    const dateInputs = this.dialog.locator('input[type="date"]');
    await dateInputs.first().fill(startDate);
    await dateInputs.last().fill(endDate);
  }

  async expectTermVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible({ timeout: 10_000 });
  }

  async editTerm(name: string) {
    const termItem = this.page.locator('[class*="cursor-pointer"]', {
      hasText: name,
    });
    await termItem.getByRole('button').nth(1).click();
    await expect(this.dialog).toBeVisible();
  }

  async deleteTerm(name: string) {
    const termItem = this.page.locator('[class*="cursor-pointer"]', {
      hasText: name,
    });
    await termItem.getByRole('button').last().click();
    const confirmButton = this.page.getByRole('button', { name: /delete/i });
    await confirmButton.click();
  }
}
