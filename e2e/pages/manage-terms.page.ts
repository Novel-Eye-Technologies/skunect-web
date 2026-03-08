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
      this.page.getByText('Academic Sessions', { exact: true })
    ).toBeVisible({ timeout: 10_000 });
  }

  // --- Session methods ---

  async clickAddSession() {
    // Try the "Add Session" button in the empty state first, fallback to "Add" header button
    const addSessionBtn = this.page.getByRole('button', {
      name: /add session/i,
    });
    const addBtn = this.page.getByRole('button', { name: 'Add' }).first();

    if (await addSessionBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await addSessionBtn.click();
    } else {
      await addBtn.click();
    }
    await expect(this.dialog).toBeVisible();
  }

  async fillSessionForm(name: string, startDate: string, endDate: string) {
    await this.dialog.getByPlaceholder('e.g. 2024/2025').fill(name);
    const dateInputs = this.dialog.locator('input[type="date"]');
    await dateInputs.first().fill(startDate);
    await dateInputs.last().fill(endDate);
  }

  async submitForm() {
    const submitButton = this.dialog.getByRole('button', {
      name: /^create$|^update$/i,
    });
    await submitButton.click();
  }

  async expectSessionVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible({ timeout: 10_000 });
  }

  async selectSession(name: string) {
    const sessionItem = this.page.locator('[class*="cursor-pointer"]', {
      hasText: name,
    });
    await sessionItem.click();
  }

  async editSession(name: string) {
    const sessionItem = this.page.locator('[class*="cursor-pointer"]', {
      hasText: name,
    });
    // Buttons: [set-current (optional)], [edit (pencil)], [delete (trash)]
    // Use aria-label or title if available, otherwise find the pencil icon button
    // The edit button has a Pencil icon — it's the second-to-last button
    const buttons = sessionItem.locator('button');
    const count = await buttons.count();
    // Edit is always the second-to-last button
    await buttons.nth(count - 2).click();
    await expect(this.dialog).toBeVisible();
  }

  async deleteSession(name: string) {
    const sessionItem = this.page.locator('[class*="cursor-pointer"]', {
      hasText: name,
    });
    // Delete is always the last button (trash icon)
    await sessionItem.locator('button').last().click();
    // ConfirmDialog uses AlertDialog role — find confirm button inside it
    const alertDialog = this.page.locator('[role="alertdialog"]');
    await expect(alertDialog).toBeVisible({ timeout: 3_000 });
    const confirmButton = alertDialog.getByRole('button', { name: /delete/i });
    await confirmButton.click();
    // Wait for dialog to close
    await expect(alertDialog).not.toBeVisible({ timeout: 5_000 });
  }

  // --- Term methods ---

  async clickAddTerm() {
    // Try "Add Term" button first, fallback to second "Add" button on page
    const addTermBtn = this.page.getByRole('button', { name: /add term/i });
    const addBtns = this.page.getByRole('button', { name: 'Add' });

    if (await addTermBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await addTermBtn.click();
    } else {
      // The terms panel "Add" button is the second one (first is sessions "Add")
      await addBtns.last().click();
    }
    await expect(this.dialog).toBeVisible();
  }

  async fillTermForm(name: string, startDate: string, endDate: string) {
    await this.dialog.getByPlaceholder('e.g. First Term').fill(name);
    const dateInputs = this.dialog.locator('input[type="date"]');
    await dateInputs.first().fill(startDate);
    await dateInputs.last().fill(endDate);
  }

  async expectTermVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible({ timeout: 10_000 });
  }

  async editTerm(name: string) {
    // Term cards use rounded-lg border p-4 (no cursor-pointer like sessions)
    const termItem = this.page.locator('.rounded-lg.border.p-4', {
      hasText: name,
    });
    // Edit is the pencil button (second-to-last)
    const buttons = termItem.locator('button');
    const count = await buttons.count();
    await buttons.nth(count - 2).click();
    await expect(this.dialog).toBeVisible();
  }

  async deleteTerm(name: string) {
    const termItem = this.page.locator('.rounded-lg.border.p-4', {
      hasText: name,
    });
    // Delete is the last button (trash icon)
    await termItem.locator('button').last().click();
    // ConfirmDialog uses AlertDialog role
    const alertDialog = this.page.locator('[role="alertdialog"]');
    await expect(alertDialog).toBeVisible({ timeout: 3_000 });
    const confirmButton = alertDialog.getByRole('button', { name: /delete/i });
    await confirmButton.click();
    await expect(alertDialog).not.toBeVisible({ timeout: 5_000 });
  }
}
