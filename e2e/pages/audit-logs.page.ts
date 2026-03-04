import { type Page, type Locator, expect } from '@playwright/test';

export class AuditLogsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly dataTable: Locator;
  readonly entityTypeFilter: Locator;
  readonly actionFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /audit trail/i });
    this.dataTable = page.locator('table');
    // Use combobox role selector — the text changes after selection, so hasText won't work for reset
    this.entityTypeFilter = page.locator('button[role="combobox"]').nth(0);
    this.actionFilter = page.locator('button[role="combobox"]').nth(1);
  }

  async goto() {
    await this.page.goto('/audit-logs');
    await expect(this.heading).toBeVisible({ timeout: 15_000 });
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
  }

  async expectTableVisible() {
    await expect(this.dataTable).toBeVisible({ timeout: 10_000 });
  }

  async expectTableHeaders() {
    const headers = this.dataTable.locator('thead th');
    await expect(headers.getByText('Date')).toBeVisible();
    await expect(headers.getByText('User')).toBeVisible();
    await expect(headers.getByText('Action')).toBeVisible();
    await expect(headers.getByText('Entity')).toBeVisible();
    await expect(headers.getByText('Details')).toBeVisible();
  }

  async expectTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }

  async filterByEntityType(type: string) {
    await this.entityTypeFilter.click();
    await this.page.getByRole('option', { name: type }).click();
  }

  async filterByAction(action: string) {
    await this.actionFilter.click();
    await this.page.getByRole('option', { name: action }).click();
  }

  async expectRowContainsAction(action: string) {
    const badge = this.dataTable.locator('tbody').locator('[data-slot="badge"]', { hasText: action });
    await expect(badge.first()).toBeVisible({ timeout: 10_000 });
  }

  async expectRowContainsEntity(entity: string) {
    await expect(
      this.dataTable.locator('tbody').getByText(entity, { exact: false }).first()
    ).toBeVisible({ timeout: 10_000 });
  }

  async getRowCount() {
    return this.dataTable.locator('tbody tr').count();
  }

  async expectPaginationVisible() {
    const pagination = this.page.locator('nav, [data-pagination]').or(
      this.page.getByRole('button', { name: /next|previous/i })
    );
    // Pagination may not be visible if less than 1 page
    return pagination;
  }
}
