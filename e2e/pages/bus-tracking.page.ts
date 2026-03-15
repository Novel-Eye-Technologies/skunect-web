import { type Page, type Locator, expect } from '@playwright/test';

export class BusTrackingPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /bus tracking/i });
    this.description = page.getByText(
      "Track your children's school bus status in real time."
    );
  }

  async goto() {
    await this.page.goto('/bus/tracking');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async expectChildCard(childName: string) {
    await expect(
      this.page.getByText(childName, { exact: true }).first()
    ).toBeVisible({ timeout: 10_000 });
  }

  async expectNoChildren() {
    await expect(
      this.page.getByText(/no children found/i)
    ).toBeVisible({ timeout: 10_000 });
  }

  async expectBusInfo(plateNumber: string) {
    await expect(
      this.page.getByText(plateNumber)
    ).toBeVisible({ timeout: 10_000 });
  }

  async expectPickupPoint(pickupPoint: string) {
    await expect(
      this.page.getByText(pickupPoint)
    ).toBeVisible({ timeout: 10_000 });
  }
}
