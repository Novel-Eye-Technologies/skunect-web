import { type Page, type Locator, expect } from '@playwright/test';

export class CalendarPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly createButton: Locator;
  readonly calendar: Locator;
  readonly dayEventsPanel: Locator;
  readonly dialog: Locator;
  readonly loadingSkeleton: Locator;

  // Form elements
  readonly titleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly startTimeInput: Locator;
  readonly endTimeInput: Locator;
  readonly locationInput: Locator;
  readonly visibilitySelect: Locator;
  readonly reminderSelect: Locator;
  readonly classEventToggle: Locator;
  readonly classSelect: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /calendar/i });
    this.description = page.getByText(
      'View and manage school events and schedules.'
    );
    this.createButton = page.getByRole('button', { name: /create event/i });
    this.calendar = page.locator('.rdp');
    this.dayEventsPanel = page.locator('[data-slot="card"]').last();
    this.dialog = page.getByRole('dialog');
    this.loadingSkeleton = page.locator('.animate-pulse');

    // Form elements inside the dialog
    this.titleInput = page.getByPlaceholder('e.g. Parent-Teacher Meeting');
    this.descriptionTextarea = page.getByPlaceholder('Describe the event...');
    this.startTimeInput = this.dialog
      .locator('input[type="datetime-local"]')
      .first();
    this.endTimeInput = this.dialog
      .locator('input[type="datetime-local"]')
      .last();
    this.locationInput = page.getByPlaceholder('e.g. School Hall');
    this.visibilitySelect = this.dialog.getByRole('combobox').first();
    this.reminderSelect = this.dialog.getByRole('combobox').nth(1);
    this.classEventToggle = this.dialog.locator('#class-event-toggle');
    this.classSelect = this.dialog.getByRole('combobox').last();
    this.cancelButton = this.dialog.getByRole('button', { name: /cancel/i });
    this.submitButton = this.dialog.getByRole('button', {
      name: /create event|save changes/i,
    });
  }

  async goto() {
    await this.page.goto('/calendar');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async expectLoaded() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
    // Wait for the loading skeleton to disappear (data loaded)
    await expect(this.loadingSkeleton).not.toBeVisible({ timeout: 15_000 });
  }

  async clickCreateEvent() {
    await this.createButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillEventForm(data: {
    title: string;
    startTime: string;
    description?: string;
    endTime?: string;
    location?: string;
  }) {
    await this.titleInput.fill(data.title);
    await this.startTimeInput.fill(data.startTime);
    if (data.description) {
      await this.descriptionTextarea.fill(data.description);
    }
    if (data.endTime) {
      await this.endTimeInput.fill(data.endTime);
    }
    if (data.location) {
      await this.locationInput.fill(data.location);
    }
  }

  async selectVisibility(value: 'Teachers & Parents' | 'Teachers Only') {
    await this.visibilitySelect.click();
    await this.page.getByRole('option', { name: value }).click();
  }

  async selectReminder(
    value: '15 minutes before' | '30 minutes before' | '1 hour before' | '1 day before'
  ) {
    await this.reminderSelect.click();
    await this.page.getByRole('option', { name: value }).click();
  }

  async toggleClassEvent() {
    await this.classEventToggle.click();
  }

  async selectClass(className: string | RegExp) {
    await this.classSelect.click();
    const option = this.page
      .getByRole('option', { name: className })
      .first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async cancelForm() {
    await this.cancelButton.click();
  }

  async expectDialogHidden() {
    await expect(this.dialog).not.toBeVisible({ timeout: 10_000 });
  }

  async expectEventVisible(title: string) {
    await expect(this.page.getByText(title)).toBeVisible({ timeout: 10_000 });
  }

  async expectEventNotVisible(title: string) {
    await expect(this.page.getByText(title)).not.toBeVisible({
      timeout: 5_000,
    });
  }

  async expectNoEventsMessage() {
    await expect(
      this.page.getByText(/no events on this day/i)
    ).toBeVisible({ timeout: 10_000 });
  }

  async clickDay(dayNumber: number) {
    const dayButton = this.calendar.getByRole('button', {
      name: String(dayNumber),
      exact: true,
    });
    await dayButton.click();
  }

  async expectDayEventsDate(dateText: string | RegExp) {
    await expect(
      this.dayEventsPanel.getByText(dateText)
    ).toBeVisible({ timeout: 10_000 });
  }

  async expectEventLocation(title: string, location: string) {
    const eventRow = this.page.locator('div', { hasText: title });
    await expect(eventRow.getByText(location)).toBeVisible();
  }

  async expectEventBadge(title: string, badgeText: string) {
    const eventRow = this.page.locator('.rounded-lg.border', {
      hasText: title,
    });
    await expect(
      eventRow.locator('[data-slot="badge"]', { hasText: badgeText })
    ).toBeVisible();
  }

  async clickEditEvent(title: string) {
    const eventRow = this.page.locator('.rounded-lg.border', {
      hasText: title,
    });
    // Edit button has a Pencil icon
    const editButton = eventRow.getByRole('button').first();
    await editButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async clickDeleteEvent(title: string) {
    const eventRow = this.page.locator('.rounded-lg.border', {
      hasText: title,
    });
    // Delete button is the second icon button (text-destructive)
    const deleteButton = eventRow
      .getByRole('button')
      .filter({ has: this.page.locator('.text-destructive') })
      .or(eventRow.getByRole('button').last());
    await deleteButton.click();
  }

  async expectCalendarLegend() {
    await expect(this.page.getByText('School Event')).toBeVisible();
    await expect(this.page.getByText('Class Event')).toBeVisible();
  }

  async expectCreateButtonHidden() {
    await expect(this.createButton).not.toBeVisible();
  }

  async expectEditDeleteHidden(title: string) {
    const eventRow = this.page.locator('.rounded-lg.border', {
      hasText: title,
    });
    // The edit/delete button container should not exist for parents
    const actionButtons = eventRow.getByRole('button');
    await expect(actionButtons).toHaveCount(0, { timeout: 5_000 });
  }
}
