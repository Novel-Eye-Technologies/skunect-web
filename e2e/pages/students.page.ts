import { type Page, type Locator, expect } from '@playwright/test';

export class StudentsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly addStudentButton: Locator;
  readonly searchInput: Locator;
  readonly dataTable: Locator;

  constructor(page: Page) {
    this.page = page;
    // PageHeader renders title as <h1>
    this.heading = page.getByRole('heading', { name: /students/i });
    this.description = page.getByText('Manage student records and information.');
    this.addStudentButton = page.getByRole('button', { name: /add student/i });
    this.searchInput = page.getByPlaceholder('Search students...');
    this.dataTable = page.locator('table');
  }

  async goto() {
    await this.page.goto('/students');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async searchStudent(name: string) {
    await this.searchInput.fill(name);
  }

  async expectStudentInTable(name: string) {
    await expect(this.dataTable.getByText(name)).toBeVisible();
  }

  async expectTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }

  async clickStudentRow(name: string) {
    await this.dataTable.getByText(name).click();
  }
}
