import { type Page, type Locator, expect } from '@playwright/test';

export class BroadcastsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly newBroadcastButton: Locator;
  readonly emptyState: Locator;
  readonly broadcastCards: Locator;

  // Dialog elements
  readonly dialog: Locator;
  readonly titleInput: Locator;
  readonly messageTextarea: Locator;
  readonly targetSelect: Locator;
  readonly roleSelect: Locator;
  readonly classIdInput: Locator;
  readonly sendButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /broadcasts/i });
    this.newBroadcastButton = page.getByRole('button', { name: /new broadcast/i });
    this.emptyState = page.getByText(/no broadcasts sent yet/i);
    this.broadcastCards = page.locator('[data-slot="card"]');

    this.dialog = page.getByRole('dialog');
    this.titleInput = page.getByPlaceholder('Broadcast title');
    this.messageTextarea = page.getByPlaceholder('Write your message...');
    this.targetSelect = this.dialog.locator('button[role="combobox"]').first();
    this.roleSelect = this.dialog.locator('button[role="combobox"]').nth(1);
    this.classIdInput = page.getByPlaceholder('Enter class ID');
    this.sendButton = page.getByRole('button', { name: /send broadcast/i });
  }

  async goto() {
    await this.page.goto('/broadcasts');
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
  }

  async clickNewBroadcast() {
    await this.newBroadcastButton.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillBroadcastForm(title: string, message: string) {
    await this.titleInput.fill(title);
    await this.messageTextarea.fill(message);
  }

  async selectTargetType(targetType: string) {
    // Click the Target Audience select
    await this.targetSelect.click();
    await this.page.getByRole('option', { name: targetType }).click();
  }

  async selectRole(role: string) {
    await this.roleSelect.click();
    await this.page.getByRole('option', { name: role }).click();
  }

  async submitBroadcast() {
    await this.sendButton.click();
  }

  async expectBroadcastInList(title: string) {
    await expect(this.page.getByText(title)).toBeVisible({ timeout: 10_000 });
  }

  async expectBroadcastCount(minCount: number) {
    const cards = this.page.locator('[data-slot="card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(minCount);
  }

  async getBroadcastBadge(title: string) {
    const card = this.page.locator('[data-slot="card"]', { hasText: title });
    return card.locator('[data-slot="badge"]');
  }
}
