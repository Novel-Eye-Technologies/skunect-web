import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  // Elements
  readonly pageHeading: Locator;

  // Parent dashboard sections
  readonly academicPerformanceCard: Locator;
  readonly subjectPerformanceCard: Locator;
  readonly recentAssessmentsCard: Locator;
  readonly attendanceMetricsCard: Locator;

  constructor(page: Page) {
    this.page = page;
    // The dashboard uses <PageHeader title="Welcome back, FirstName" /> which
    // renders as <h1>. Use h1 locator to avoid matching the login page <h2>.
    this.pageHeading = page.locator('h1').filter({ hasText: /welcome back/i });

    // Parent dashboard enhanced sections
    this.academicPerformanceCard = page.locator('[data-testid="academic-performance-card"]');
    this.subjectPerformanceCard = page.locator('[data-testid="subject-performance-card"]');
    this.recentAssessmentsCard = page.locator('[data-testid="recent-assessments-card"]');
    this.attendanceMetricsCard = page.locator('[data-testid="attendance-metrics-card"]');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async expectVisible() {
    await expect(this.pageHeading).toBeVisible({ timeout: 20_000 });
  }

  async expectGreeting() {
    await expect(this.pageHeading).toContainText('Welcome back', {
      timeout: 20_000,
    });
  }

  async expectRoleDescription(text: string | RegExp) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async expectStatCard(label: string) {
    await expect(this.page.getByText(label)).toBeVisible();
  }

  async expectSuperAdminDashboard() {
    await expect(
      this.page.getByText(/overview of the entire platform/i)
    ).toBeVisible();
  }

  async expectAdminDashboard() {
    await expect(
      this.page.getByText(/overview of your school today/i)
    ).toBeVisible();
  }

  async expectTeacherDashboard() {
    await expect(
      this.page.getByText(/overview of your school today/i)
    ).toBeVisible();
  }

  async expectParentDashboard() {
    await expect(
      this.page.getByText(/overview of your children's progress/i)
    ).toBeVisible();
  }

  // ─── Parent Dashboard: Stat Cards ────────────────────────────────

  async expectParentStatCards() {
    await expect(this.page.getByText('My Children')).toBeVisible();
    await expect(this.page.getByText("Today's Attendance")).toBeVisible();
    await expect(this.page.getByText('Pending Fees')).toBeVisible();
    await expect(this.page.getByText('Pending Homework')).toBeVisible();
  }

  async expectChildrenOverview() {
    await expect(
      this.page.locator('[data-slot="card-title"]').filter({ hasText: 'My Children' })
    ).toBeVisible();
  }

  // ─── Parent Dashboard: Academic Performance ──────────────────────

  async expectAcademicPerformance() {
    await expect(this.academicPerformanceCard).toBeVisible({ timeout: 10_000 });
    await expect(this.academicPerformanceCard.getByText('Overall Average')).toBeVisible();
    await expect(this.academicPerformanceCard.getByText('Class Position')).toBeVisible();
    await expect(this.academicPerformanceCard.getByText('Subjects')).toBeVisible();
  }

  async getOverallAverage(): Promise<string> {
    return (await this.page.locator('[data-testid="overall-average"]').textContent()) ?? '';
  }

  async getClassPosition(): Promise<string> {
    return (await this.page.locator('[data-testid="class-position"]').textContent()) ?? '';
  }

  // ─── Parent Dashboard: Subject Performance ───────────────────────

  async expectSubjectPerformance() {
    await expect(this.subjectPerformanceCard).toBeVisible({ timeout: 10_000 });
    await expect(
      this.subjectPerformanceCard.getByText('Subject Performance Overview')
    ).toBeVisible();
  }

  // ─── Parent Dashboard: Recent Assessments ────────────────────────

  async expectRecentAssessments() {
    await expect(this.recentAssessmentsCard).toBeVisible({ timeout: 10_000 });
    await expect(
      this.recentAssessmentsCard.getByText('Recent Assessments')
    ).toBeVisible();
  }

  // ─── Parent Dashboard: Attendance Metrics ────────────────────────

  async expectAttendanceMetrics() {
    await expect(this.attendanceMetricsCard).toBeVisible({ timeout: 10_000 });
    await expect(this.attendanceMetricsCard.getByText('Present Days')).toBeVisible();
    await expect(this.attendanceMetricsCard.getByText('Late Days')).toBeVisible();
    await expect(this.attendanceMetricsCard.getByText('Absent Days')).toBeVisible();
    await expect(this.attendanceMetricsCard.getByText('Attendance Rate')).toBeVisible();
  }

  async getAttendanceRate(): Promise<string> {
    return (await this.page.locator('[data-testid="attendance-rate"]').textContent()) ?? '';
  }

  // ─── Parent Dashboard: Fees & Homework ───────────────────────────

  async expectUpcomingFees() {
    await expect(
      this.page.locator('[data-slot="card-title"]').filter({ hasText: 'Upcoming Fees' })
    ).toBeVisible();
  }

  async expectRecentHomework() {
    await expect(
      this.page.locator('[data-slot="card-title"]').filter({ hasText: 'Recent Homework' })
    ).toBeVisible();
  }
}
