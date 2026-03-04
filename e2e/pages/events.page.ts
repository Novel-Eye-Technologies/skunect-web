import { type Page, type Locator, expect } from '@playwright/test';

export class EventsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly createEventButton: Locator;
  readonly emptyState: Locator;
  readonly eventCards: Locator;

  // Dialog elements
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly locationInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /events/i }).first();
    this.createEventButton = page.getByRole('button', { name: /create event/i });
    this.emptyState = page.getByText(/no events scheduled yet/i);
    this.eventCards = page.locator('[data-slot="card"]');

    this.dialog = page.getByRole('dialog');
    this.titleInput = page.getByPlaceholder('Event title');
    this.descriptionTextarea = page.getByPlaceholder('Optional description');
    this.startDateInput = this.dialog.locator('input[type="date"]').first();
    this.endDateInput = this.dialog.locator('input[type="date"]').last();
    this.locationInput = page.getByPlaceholder('Event location');
    this.submitButton = this.dialog.getByRole('button', { name: /create event/i });
  }

  async goto() {
    await this.page.goto('/events');
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
  }

  async clickCreateEvent() {
    await this.createEventButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillEventForm(data: {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    location?: string;
  }) {
    await this.titleInput.fill(data.title);
    if (data.description) {
      await this.descriptionTextarea.fill(data.description);
    }
    await this.startDateInput.fill(data.startDate);
    if (data.endDate) {
      await this.endDateInput.fill(data.endDate);
    }
    if (data.location) {
      await this.locationInput.fill(data.location);
    }
  }

  async submitEvent() {
    await this.submitButton.click();
  }

  async expectEventInList(title: string) {
    await expect(this.page.getByText(title)).toBeVisible({ timeout: 10_000 });
  }

  async expectEventNotInList(title: string) {
    await expect(this.page.getByText(title)).not.toBeVisible({ timeout: 5_000 });
  }

  async deleteEvent(title: string) {
    const card = this.page.locator('[data-slot="card"]', { hasText: title });
    const deleteButton = card.getByRole('button');
    await deleteButton.click();
  }

  async expectEventStatus(title: string, status: string) {
    const card = this.page.locator('[data-slot="card"]', { hasText: title });
    const badge = card.locator('[data-slot="badge"]');
    await expect(badge).toContainText(status);
  }

  async expectEventLocation(title: string, location: string) {
    const card = this.page.locator('[data-slot="card"]', { hasText: title });
    await expect(card.getByText(location)).toBeVisible();
  }
}
