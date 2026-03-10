import { test, expect } from '../../fixtures/auth.fixture';
import { DashboardPage } from '../../pages/dashboard.page';
import { AnnouncementsPage } from '../../pages/communication.page';

test.describe('Parent Dashboard', () => {
  test('parent sees children overview with greeting', async ({ parentPage }) => {
    const dashboard = new DashboardPage(parentPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
    await dashboard.expectParentDashboard();
  });

  test('parent sees all stat cards', async ({ parentPage }) => {
    const dashboard = new DashboardPage(parentPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectParentStatCards();
  });

  test('parent sees children overview section', async ({ parentPage }) => {
    const dashboard = new DashboardPage(parentPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    // Check that the children card with "Children enrolled at" description exists
    await expect(
      parentPage.getByText(/children enrolled at/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test('parent sees upcoming fees section', async ({ parentPage }) => {
    const dashboard = new DashboardPage(parentPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    // Scroll to bottom to find the fees section
    await parentPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await dashboard.expectUpcomingFees();
  });

  test('parent sees recent homework section', async ({ parentPage }) => {
    const dashboard = new DashboardPage(parentPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    // Scroll to bottom to find the homework section
    await parentPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await dashboard.expectRecentHomework();
  });

  test.describe('Academic Performance', () => {
    test('parent sees academic performance card when data is available', async ({
      parentPage,
    }) => {
      const dashboard = new DashboardPage(parentPage);
      await dashboard.goto();
      await dashboard.expectVisible();
      // Academic performance is optional - check if the card exists
      const isVisible = await dashboard.academicPerformanceCard.isVisible().catch(() => false);
      if (isVisible) {
        await dashboard.expectAcademicPerformance();
        // Verify the overall average contains a percentage
        const average = await dashboard.getOverallAverage();
        expect(average).toMatch(/%$/);
        // Verify class position shows position/total
        const position = await dashboard.getClassPosition();
        expect(position).toMatch(/\d+/);
      }
    });
  });

  test.describe('Subject Performance', () => {
    test('parent sees subject performance overview when data is available', async ({
      parentPage,
    }) => {
      const dashboard = new DashboardPage(parentPage);
      await dashboard.goto();
      await dashboard.expectVisible();
      const isVisible = await dashboard.subjectPerformanceCard.isVisible().catch(() => false);
      if (isVisible) {
        await dashboard.expectSubjectPerformance();
        // Verify progress bars exist
        const progressBars = dashboard.subjectPerformanceCard.locator('[data-slot="progress"]');
        expect(await progressBars.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Recent Assessments', () => {
    test('parent sees recent assessments when data is available', async ({
      parentPage,
    }) => {
      const dashboard = new DashboardPage(parentPage);
      await dashboard.goto();
      await dashboard.expectVisible();
      const isVisible = await dashboard.recentAssessmentsCard.isVisible().catch(() => false);
      if (isVisible) {
        await dashboard.expectRecentAssessments();
        // Verify assessment entries show score format (number/number)
        const scores = dashboard.page.locator('[data-testid="assessment-score"]');
        if ((await scores.count()) > 0) {
          const firstScore = await scores.first().textContent();
          expect(firstScore).toMatch(/\d+\/\d+/);
        }
      }
    });
  });

  test.describe('Attendance Metrics', () => {
    test('parent sees attendance metrics when data is available', async ({
      parentPage,
    }) => {
      const dashboard = new DashboardPage(parentPage);
      await dashboard.goto();
      await dashboard.expectVisible();
      const isVisible = await dashboard.attendanceMetricsCard.isVisible().catch(() => false);
      if (isVisible) {
        await dashboard.expectAttendanceMetrics();
        // Verify attendance rate shows a percentage
        const rate = await dashboard.getAttendanceRate();
        expect(rate).toMatch(/%$/);
      }
    });
  });
});

test.describe('Parent Announcements - Read-only', () => {
  test('parent can view announcements but cannot create', async ({
    parentPage,
  }) => {
    const announcements = new AnnouncementsPage(parentPage);
    await announcements.goto();
    await announcements.expectVisible();
    // Parent should NOT see the Create Announcement button
    await expect(announcements.createButton).not.toBeVisible();
  });

  test('parent cannot see edit or delete actions on announcements', async ({
    parentPage,
  }) => {
    const announcements = new AnnouncementsPage(parentPage);
    await announcements.goto();
    await announcements.expectVisible();
    // If there are announcement rows, check no action menus exist for parent
    const actionButtons = parentPage.locator('button').filter({ hasText: /open menu/i });
    // Parent should not see any action dropdown triggers on the table
    const count = await actionButtons.count();
    // Either no action buttons exist, or they only have "View" (not Edit/Delete)
    if (count > 0) {
      // Click the first action to check what options are available
      await actionButtons.first().click();
      // Should NOT see Edit, Delete, Publish, Unpublish
      await expect(parentPage.getByRole('menuitem', { name: /edit/i })).not.toBeVisible();
      await expect(parentPage.getByRole('menuitem', { name: /delete/i })).not.toBeVisible();
      await expect(parentPage.getByRole('menuitem', { name: /publish/i })).not.toBeVisible();
    }
  });
});

test.describe('Unread Message Badge', () => {
  test('sidebar shows Messages nav item', async ({ parentPage }) => {
    const dashboard = new DashboardPage(parentPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    // The sidebar should have a Communication section with Messages
    // Look for the Messages link in the sidebar
    const sidebar = parentPage.locator('aside');
    const messagesLink = sidebar.getByText('Messages');
    await expect(messagesLink).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Cross-school parent', () => {
  test('cross-school parent can see dashboard', async ({
    parentCrossPage,
  }) => {
    const dashboard = new DashboardPage(parentCrossPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectParentDashboard();
  });
});
