import { type Page, type Locator, expect } from '@playwright/test';

export class PickupAuthorizationPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly addAuthorizationButton: Locator;
  readonly childFilter: Locator;
  readonly dialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Pickup Authorization', exact: true });
    this.description = page.getByText(
      'Manage authorized pickup persons for your children.'
    );
    this.addAuthorizationButton = page.getByRole('button', { name: /add authorization/i });
    this.childFilter = page.locator('button[role="combobox"]').first();
    this.dialog = page.locator('[data-slot="dialog-content"]');
  }

  async goto() {
    await this.page.goto('/safety/pickup');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async createAuthorization(
    childName: string,
    personName: string,
    relationship: string,
    phone?: string,
  ) {
    await this.addAuthorizationButton.first().click();
    await expect(this.dialog).toBeVisible({ timeout: 10_000 });

    // Select child
    const childCombo = this.dialog.getByRole('combobox').first();
    await childCombo.click();
    await this.page.getByRole('option', { name: childName }).click();

    // Fill person name
    await this.dialog.getByLabel(/authorized person name/i).fill(personName);

    // Fill phone if provided
    if (phone) {
      await this.dialog.getByLabel(/phone number/i).fill(phone);
    }

    // Select relationship
    const relationshipCombo = this.dialog.getByRole('combobox').nth(1);
    await relationshipCombo.click();
    await this.page.getByRole('option', { name: new RegExp(relationship, 'i') }).click();

    // Submit
    await this.dialog.getByRole('button', { name: /add authorization/i }).click();
  }

  async expectAuthorizationCard(personName: string) {
    await expect(
      this.page.getByText(personName, { exact: true }).first()
    ).toBeVisible({ timeout: 10_000 });
  }

  async expectEmptyState() {
    await expect(
      this.page.getByText(/no pickup authorizations/i)
    ).toBeVisible({ timeout: 10_000 });
  }

  async revokeAuthorization(personName: string) {
    const card = this.page.locator('[data-slot="card"]').filter({
      hasText: personName,
    });
    await card.getByRole('button', { name: /revoke/i }).click();

    // Confirm revocation dialog
    const confirmDialog = this.page.locator('[role="alertdialog"]');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole('button', { name: /revoke/i }).click();
  }
}
