import { type Page, type Locator, expect } from '@playwright/test';

export class AttendancePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly markAttendanceTab: Locator;
  readonly recordsTab: Locator;
  readonly dataTable: Locator;

  constructor(page: Page) {
    this.page = page;
    // PageHeader renders title as <h1>
    this.heading = page.getByRole('heading', { name: /attendance/i });
    this.description = page.getByText(
      'Mark and view student attendance records.'
    );
    this.markAttendanceTab = page.getByRole('tab', {
      name: /mark attendance/i,
    });
    this.recordsTab = page.getByRole('tab', { name: /records/i });
    this.dataTable = page.locator('table');
  }

  async goto() {
    await this.page.goto('/attendance');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async switchToMarkAttendance() {
    await this.markAttendanceTab.click();
  }

  async switchToRecords() {
    await this.recordsTab.click();
  }
}
