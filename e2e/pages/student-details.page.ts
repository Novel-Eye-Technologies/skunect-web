import { type Page, type Locator, expect } from '@playwright/test';

export class StudentDetailsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly profileTab: Locator;
  readonly parentsTab: Locator;
  readonly documentsTab: Locator;
  readonly backButton: Locator;
  readonly editButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.profileTab = page.getByRole('tab', { name: /profile/i });
    this.parentsTab = page.getByRole('tab', { name: /parents/i });
    this.documentsTab = page.getByRole('tab', { name: /documents/i });
    this.backButton = page.getByRole('button', { name: /back/i });
    this.editButton = page.getByRole('button', { name: /edit/i });
  }

  async goto(studentId: string) {
    await this.page.goto(`/students/${studentId}`);
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async expectStudentName(name: string) {
    await expect(this.heading).toContainText(name, { timeout: 10_000 });
  }

  async expectAdmissionNumber(admissionNo: string) {
    await expect(
      this.page.getByText(`Admission No: ${admissionNo}`)
    ).toBeVisible();
  }

  async viewProfileTab() {
    await this.profileTab.click();
  }

  async viewParentsTab() {
    await this.parentsTab.click();
  }

  async viewDocumentsTab() {
    await this.documentsTab.click();
  }

  async expectProfileField(label: string, value: string) {
    const fieldSection = this.page.locator('text=' + label).locator('..');
    await expect(fieldSection).toContainText(value);
  }

  async expectParentVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible({ timeout: 10_000 });
  }

  async goBack() {
    await this.backButton.click();
  }
}
