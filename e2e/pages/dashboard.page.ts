import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  // Elements
  readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    // The dashboard uses <PageHeader title="Welcome back, FirstName" /> which
    // renders as <h1>. Use h1 locator to avoid matching the login page <h2>.
    this.pageHeading = page.locator('h1').filter({ hasText: /welcome back/i });
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async expectVisible() {
    await expect(this.pageHeading).toBeVisible({ timeout: 20_000 });
  }

  /**
   * Verify the dashboard greeting heading is visible.
   * The heading text is "Welcome back, FirstName" rendered as an h1
   * via the PageHeader component.
   */
  async expectGreeting() {
    await expect(this.pageHeading).toContainText('Welcome back', {
      timeout: 20_000,
    });
  }

  /** Check that the description matches the expected role text. */
  async expectRoleDescription(text: string | RegExp) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /** Check that specific stat cards are visible. */
  async expectStatCard(label: string) {
    await expect(this.page.getByText(label)).toBeVisible();
  }

  /** Super Admin: Expect system-wide stats. */
  async expectSuperAdminDashboard() {
    await expect(
      this.page.getByText(/overview of the entire platform/i)
    ).toBeVisible();
  }

  /** Admin: Expect school dashboard. */
  async expectAdminDashboard() {
    await expect(
      this.page.getByText(/overview of your school today/i)
    ).toBeVisible();
  }

  /** Teacher: Expect teacher dashboard. */
  async expectTeacherDashboard() {
    await expect(
      this.page.getByText(/overview of your school today/i)
    ).toBeVisible();
  }

  /** Parent: Expect parent dashboard. */
  async expectParentDashboard() {
    await expect(
      this.page.getByText(/overview of your children's progress/i)
    ).toBeVisible();
  }
}
