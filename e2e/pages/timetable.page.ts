import { type Page, type Locator, expect } from '@playwright/test';

export class TimetablePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly sessionSelect: Locator;
  readonly classSelect: Locator;
  readonly timetableGrid: Locator;
  readonly emptyState: Locator;

  // Slot dialog elements
  readonly slotDialog: Locator;
  readonly subjectSelect: Locator;
  readonly customLabelInput: Locator;
  readonly createSlotButton: Locator;
  readonly cancelSlotButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /timetable/i });
    this.sessionSelect = page.locator('button').filter({ hasText: /select session/i });
    this.classSelect = page.locator('button').filter({ hasText: /select class/i });
    this.timetableGrid = page.locator('table');
    this.emptyState = page.getByText(/select a session and class/i);

    this.slotDialog = page.getByRole('dialog');
    this.subjectSelect = this.slotDialog.locator('button[data-slot="select-trigger"]');
    this.customLabelInput = page.getByPlaceholder('Enter optional label');
    this.createSlotButton = page.getByRole('button', { name: /create slot/i });
    this.cancelSlotButton = this.slotDialog.getByRole('button', { name: /cancel/i });
  }

  async goto() {
    await this.page.goto('/timetable');
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible({ timeout: 10_000 });
  }

  async selectSession(index: number = 0) {
    await this.sessionSelect.click();
    const options = this.page.getByRole('option');
    await options.nth(index).click();
  }

  async selectClass(index: number = 0) {
    await this.classSelect.click();
    const options = this.page.getByRole('option');
    await options.nth(index).click();
  }

  async expectGridVisible() {
    await expect(this.timetableGrid).toBeVisible({ timeout: 15_000 });
  }

  async expectGridHeaders() {
    const headers = this.timetableGrid.locator('thead th');
    await expect(headers.getByText('Period')).toBeVisible();
    await expect(headers.getByText('MON')).toBeVisible();
    await expect(headers.getByText('FRI')).toBeVisible();
  }

  async clickEmptySlot(day: string, period: number) {
    // Find the cell at the intersection of day column and period row
    const dayIndex = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].indexOf(day);
    if (dayIndex === -1) throw new Error(`Invalid day: ${day}`);
    const row = this.timetableGrid.locator('tbody tr').nth(period - 1);
    const cell = row.locator('td').nth(dayIndex + 1); // +1 for period label column
    // Hover over cell to reveal the "+" button (only visible on hover)
    await cell.hover();
    const addButton = cell.getByRole('button');
    await expect(addButton).toBeVisible({ timeout: 10_000 });
    await addButton.click();
    await expect(this.slotDialog).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Select a subject from the dropdown, or pick "Other" and type a custom label.
   * Matches against option text visible in the dropdown.
   */
  async fillSlotForm(label: string) {
    await this.subjectSelect.click();
    const option = this.page.getByRole('option', { name: label, exact: true });
    const hasOption = await option.isVisible({ timeout: 3_000 }).catch(() => false);

    if (hasOption) {
      await option.click();
    } else {
      // Label not in the dropdown — select "Other" and type it manually
      await this.page.getByRole('option', { name: 'Other' }).click();
      await expect(this.customLabelInput).toBeVisible({ timeout: 5_000 });
      await this.customLabelInput.fill(label);
    }
  }

  async submitSlotForm() {
    await this.createSlotButton.click();
  }

  async deleteSlot(slotText: string) {
    const cell = this.timetableGrid.locator('td', { hasText: slotText });
    // Hover to reveal the delete button
    await cell.hover();
    const deleteButton = cell.getByRole('button');
    await deleteButton.click();
  }

  async expectSlotInGrid(text: string) {
    await expect(this.timetableGrid.getByText(text)).toBeVisible({ timeout: 10_000 });
  }

  async expectSlotNotInGrid(text: string) {
    await expect(this.timetableGrid.getByText(text)).not.toBeVisible({ timeout: 5_000 });
  }
}
