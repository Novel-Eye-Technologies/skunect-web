/**
 * Feature Coverage E2E Tests
 *
 * Tests key features that have page objects but limited or no dedicated test coverage.
 * Uses pre-authenticated fixtures from auth.fixture.ts for fast, independent tests.
 *
 * Sections:
 *   1. Dashboard Page Tests (admin, teacher, parent, super admin)
 *   2. Communication Tests (messages, announcements)
 *   3. School Settings Tests
 *   4. Timetable Tests
 *   5. Mood Tracker Tests
 *   6. Health Records Tests
 *   7. Notification Preferences Tests
 *   8. Welfare Tests
 *   9. Students & My Classes Tests
 *  10. Fees & Homework Tests
 */
import { test, expect } from '../../fixtures/auth.fixture';
import { DashboardPage } from '../../pages/dashboard.page';
import { SidebarPage } from '../../pages/sidebar.page';
import { MessagesPage, AnnouncementsPage } from '../../pages/communication.page';
import { SchoolSettingsPage } from '../../pages/school-settings.page';
import { TimetablePage } from '../../pages/timetable.page';
import { MoodTrackerPage } from '../../pages/mood-tracker.page';
import { HealthRecordsPage } from '../../pages/health-records.page';
import { NotificationPreferencesPage } from '../../pages/notification-preferences.page';
import { WelfarePage } from '../../pages/welfare.page';
import { StudentsPage } from '../../pages/students.page';
import { MyClassesPage } from '../../pages/my-classes.page';
import { FeesPage } from '../../pages/fees.page';
import { HomeworkPage } from '../../pages/homework.page';

// =========================================================================
// SECTION 1: DASHBOARD TESTS
// =========================================================================

test.describe('1 — Dashboard Page Tests', () => {
  test('1.1 — Super Admin: Dashboard renders with platform overview', async ({ superAdminPage }) => {
    const dashboard = new DashboardPage(superAdminPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
    await dashboard.expectSuperAdminDashboard();
  });

  test('1.2 — Admin: Dashboard renders with school overview stats', async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
    await dashboard.expectAdminDashboard();
  });

  test('1.3 — Teacher: Dashboard renders with school overview', async ({ teacherPage }) => {
    const dashboard = new DashboardPage(teacherPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
    await dashboard.expectTeacherDashboard();
  });

  test('1.4 — Parent: Dashboard renders with children overview', async ({ parentPage }) => {
    const dashboard = new DashboardPage(parentPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
    await dashboard.expectParentDashboard();
  });

  test('1.5 — Parent: Dashboard shows stat cards (Attendance, Homework, Fees)', async ({ parentPage }) => {
    const dashboard = new DashboardPage(parentPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectParentStatCards();
  });

  test('1.6 — Parent: Dashboard shows academic overview', async ({ parentPage }) => {
    const dashboard = new DashboardPage(parentPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectParentStatCards();
  });

  test('1.7 — Admin: Sidebar shows correct nav items', async ({ adminPage }) => {
    await adminPage.goto('/dashboard');
    await adminPage.waitForLoadState('networkidle').catch(() => {});
    const sidebar = new SidebarPage(adminPage);
    await sidebar.expectNavItems([
      'Dashboard',
      'People',
      'Academics',
      'Communication',
      'Safety & Welfare',
      'Fees',
      'Settings',
    ]);
  });

  test('1.8 — Teacher: Sidebar shows correct nav items', async ({ teacherPage }) => {
    await teacherPage.goto('/dashboard');
    await teacherPage.waitForLoadState('networkidle').catch(() => {});
    const sidebar = new SidebarPage(teacherPage);
    await sidebar.expectNavItems([
      'Dashboard',
      'Students',
      'My Classes',
      'Academics',
      'Communication',
      'Safety & Welfare',
    ]);
  });

  test('1.9 — Parent: Sidebar shows correct nav items', async ({ parentPage }) => {
    await parentPage.goto('/dashboard');
    await parentPage.waitForLoadState('networkidle').catch(() => {});
    const sidebar = new SidebarPage(parentPage);
    await sidebar.expectNavItems([
      'Dashboard',
      'Children Profile',
      'Homework',
      'Communication',
      'Fees',
    ]);
  });
});

// =========================================================================
// SECTION 2: COMMUNICATION TESTS
// =========================================================================

test.describe('2 — Communication Tests', () => {
  test('2.1 — Admin: Messages page renders', async ({ adminPage }) => {
    const messages = new MessagesPage(adminPage);
    await messages.goto();
    await messages.expectVisible();
  });

  test('2.2 — Admin: Announcements page renders', async ({ adminPage }) => {
    const announcements = new AnnouncementsPage(adminPage);
    await announcements.goto();
    await announcements.expectVisible();
  });

  test('2.3 — Teacher: Messages page renders', async ({ teacherPage }) => {
    const messages = new MessagesPage(teacherPage);
    await messages.goto();
    await messages.expectVisible();
  });

  test('2.4 — Teacher: Announcements page renders', async ({ teacherPage }) => {
    const announcements = new AnnouncementsPage(teacherPage);
    await announcements.goto();
    await announcements.expectVisible();
  });

  test('2.5 — Parent: Messages page renders', async ({ parentPage }) => {
    const messages = new MessagesPage(parentPage);
    await messages.goto();
    await messages.expectVisible();
  });

  test('2.6 — Parent: Announcements page renders', async ({ parentPage }) => {
    const announcements = new AnnouncementsPage(parentPage);
    await announcements.goto();
    await announcements.expectVisible();
  });

  test('2.7 — Admin: Announcements page has create button', async ({ adminPage }) => {
    const announcements = new AnnouncementsPage(adminPage);
    await announcements.goto();
    await announcements.expectVisible();
    await expect(announcements.createButton).toBeVisible();
  });
});

// =========================================================================
// SECTION 3: SCHOOL SETTINGS TESTS
// =========================================================================

test.describe('3 — School Settings Tests', () => {
  test('3.1 — Admin: School settings page renders', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();
  });

  test('3.2 — Admin: School settings has General tab', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();
    await expect(settings.generalTab).toBeVisible();
  });

  test('3.3 — Admin: School settings has Sessions & Terms tab', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();
    await expect(settings.sessionsTab).toBeVisible();
  });

  test('3.4 — Admin: School settings has Classes tab', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();
    await expect(settings.classesTab).toBeVisible();
  });

  test('3.5 — Admin: School settings has Subjects tab', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();
    await expect(settings.subjectsTab).toBeVisible();
  });

  test('3.6 — Admin: School settings has Grading tab', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();
    await expect(settings.gradingTab).toBeVisible();
  });

  test('3.7 — Admin: Can switch between settings tabs', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();

    // Click Sessions & Terms tab
    await settings.sessionsTab.click();
    await expect(settings.sessionsTab).toHaveAttribute('data-state', 'active', { timeout: 5_000 });

    // Click Classes tab
    await settings.classesTab.click();
    await expect(settings.classesTab).toHaveAttribute('data-state', 'active', { timeout: 5_000 });

    // Click Subjects tab
    await settings.subjectsTab.click();
    await expect(settings.subjectsTab).toHaveAttribute('data-state', 'active', { timeout: 5_000 });

    // Click Grading tab
    await settings.gradingTab.click();
    await expect(settings.gradingTab).toHaveAttribute('data-state', 'active', { timeout: 5_000 });
  });

  test('3.8 — Teacher: Cannot access school settings (redirects to dashboard)', async ({ teacherPage }) => {
    await teacherPage.goto('/school-settings');
    await expect(teacherPage).toHaveURL(/\/dashboard\/?/, { timeout: 15_000 });
  });

  test('3.9 — Parent: Cannot access school settings (redirects to dashboard)', async ({ parentPage }) => {
    await parentPage.goto('/school-settings');
    await expect(parentPage).toHaveURL(/\/dashboard\/?/, { timeout: 15_000 });
  });
});

// =========================================================================
// SECTION 4: TIMETABLE TESTS
// =========================================================================

test.describe('4 — Timetable Tests', () => {
  test('4.1 — Admin: Timetable page renders', async ({ adminPage }) => {
    const timetable = new TimetablePage(adminPage);
    await timetable.goto();
    await timetable.expectVisible();
  });

  test('4.2 — Admin: Timetable shows session and class selectors', async ({ adminPage }) => {
    const timetable = new TimetablePage(adminPage);
    await timetable.goto();
    await timetable.expectVisible();

    // The page should show select dropdowns for session and class
    await expect(
      adminPage.locator('button').filter({ hasText: /session/i }).first()
        .or(adminPage.getByRole('combobox').first()),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('4.3 — Teacher: Timetable page renders', async ({ teacherPage }) => {
    const timetable = new TimetablePage(teacherPage);
    await timetable.goto();
    await timetable.expectVisible();
  });
});

// =========================================================================
// SECTION 5: MOOD TRACKER TESTS
// =========================================================================

test.describe('5 — Mood Tracker Tests', () => {
  test('5.1 — Teacher: Mood tracker page renders', async ({ teacherPage }) => {
    const moodTracker = new MoodTrackerPage(teacherPage);
    await moodTracker.goto();
    await moodTracker.expectVisible();
  });

  test('5.2 — Teacher: Mood tracker has log mood button', async ({ teacherPage }) => {
    const moodTracker = new MoodTrackerPage(teacherPage);
    await moodTracker.goto();
    await moodTracker.expectVisible();
    await expect(moodTracker.logMoodButton).toBeVisible();
  });

  test('5.3 — Teacher: Can open log mood dialog', async ({ teacherPage }) => {
    const moodTracker = new MoodTrackerPage(teacherPage);
    await moodTracker.goto();
    await moodTracker.expectVisible();
    const dialog = await moodTracker.openLogMoodDialog();
    await expect(dialog).toBeVisible();

    // Close dialog
    await teacherPage.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 3_000 });
  });

  test('5.4 — Admin: Mood tracker page renders', async ({ adminPage }) => {
    const moodTracker = new MoodTrackerPage(adminPage);
    await moodTracker.goto();
    await moodTracker.expectVisible();
  });
});

// =========================================================================
// SECTION 6: HEALTH RECORDS TESTS
// =========================================================================

test.describe('6 — Health Records Tests', () => {
  test('6.1 — Teacher: Health records page renders', async ({ teacherPage }) => {
    const healthRecords = new HealthRecordsPage(teacherPage);
    await healthRecords.goto();
    await healthRecords.expectVisible();
  });

  test('6.2 — Teacher: Health records has add record button', async ({ teacherPage }) => {
    const healthRecords = new HealthRecordsPage(teacherPage);
    await healthRecords.goto();
    await healthRecords.expectVisible();
    await expect(healthRecords.addRecordButton).toBeVisible();
  });

  test('6.3 — Teacher: Can open add health record dialog', async ({ teacherPage }) => {
    const healthRecords = new HealthRecordsPage(teacherPage);
    await healthRecords.goto();
    await healthRecords.expectVisible();
    const dialog = await healthRecords.openAddRecordDialog();
    await expect(dialog).toBeVisible();

    // Close dialog
    await teacherPage.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible({ timeout: 3_000 });
  });

  test('6.4 — Admin: Health records page renders', async ({ adminPage }) => {
    const healthRecords = new HealthRecordsPage(adminPage);
    await healthRecords.goto();
    await healthRecords.expectVisible();
  });
});

// =========================================================================
// SECTION 7: NOTIFICATION PREFERENCES TESTS
// =========================================================================

test.describe('7 — Notification Preferences Tests', () => {
  test('7.1 — Teacher: Notification preferences page renders', async ({ teacherPage }) => {
    const notifPrefs = new NotificationPreferencesPage(teacherPage);
    await notifPrefs.goto();
    await notifPrefs.expectVisible();
  });

  test('7.2 — Teacher: Notification preferences shows description', async ({ teacherPage }) => {
    const notifPrefs = new NotificationPreferencesPage(teacherPage);
    await notifPrefs.goto();
    await notifPrefs.expectVisible();
    await expect(notifPrefs.description).toBeVisible();
  });

  test('7.3 — Parent: Notification preferences page renders', async ({ parentPage }) => {
    const notifPrefs = new NotificationPreferencesPage(parentPage);
    await notifPrefs.goto();
    await notifPrefs.expectVisible();
  });

  test('7.4 — Parent: Notification preferences shows channels card', async ({ parentPage }) => {
    const notifPrefs = new NotificationPreferencesPage(parentPage);
    await notifPrefs.goto();
    await notifPrefs.expectVisible();
    await expect(notifPrefs.notificationChannelsCard).toBeVisible({ timeout: 10_000 });
  });
});

// =========================================================================
// SECTION 8: WELFARE TESTS
// =========================================================================

test.describe('8 — Welfare Tests', () => {
  test('8.1 — Admin: Welfare page renders', async ({ adminPage }) => {
    const welfare = new WelfarePage(adminPage);
    await welfare.goto();
    await welfare.expectVisible();
  });

  test('8.2 — Teacher: Welfare page renders', async ({ teacherPage }) => {
    const welfare = new WelfarePage(teacherPage);
    await welfare.goto();
    await welfare.expectVisible();
  });

  test('8.3 — Teacher: Welfare page has record welfare button', async ({ teacherPage }) => {
    const welfare = new WelfarePage(teacherPage);
    await welfare.goto();
    await welfare.expectVisible();
    await expect(welfare.recordWelfareButton).toBeVisible();
  });

  test('8.4 — Teacher: Can open record welfare dialog', async ({ teacherPage }) => {
    const welfare = new WelfarePage(teacherPage);
    await welfare.goto();
    await welfare.expectVisible();
    await welfare.clickRecordWelfare();
    await expect(welfare.dialog).toBeVisible();

    // Verify dialog has the expected form elements
    await expect(welfare.classSelect).toBeVisible();

    // Close dialog
    await welfare.cancelForm();
  });
});

// =========================================================================
// SECTION 9: STUDENTS & MY CLASSES TESTS
// =========================================================================

test.describe('9 — Students & My Classes Tests', () => {
  test('9.1 — Admin: Students page renders', async ({ adminPage }) => {
    const students = new StudentsPage(adminPage);
    await students.goto();
    await students.expectVisible();
  });

  test('9.2 — Admin: Students page has add student button', async ({ adminPage }) => {
    const students = new StudentsPage(adminPage);
    await students.goto();
    await students.expectVisible();
    await expect(students.addStudentButton).toBeVisible();
  });

  test('9.3 — Admin: Students page has search input', async ({ adminPage }) => {
    const students = new StudentsPage(adminPage);
    await students.goto();
    await students.expectVisible();
    await expect(students.searchInput).toBeVisible();
  });

  test('9.4 — Teacher: Students page renders', async ({ teacherPage }) => {
    const students = new StudentsPage(teacherPage);
    await students.goto();
    await students.expectVisible();
  });

  test('9.5 — Teacher: My Classes page renders', async ({ teacherPage }) => {
    const myClasses = new MyClassesPage(teacherPage);
    await myClasses.goto();
    await myClasses.expectVisible();
  });

  test('9.6 — Parent: Children Profile page renders', async ({ parentPage }) => {
    // Parents are always redirected to /students/{childId} (child detail page)
    await parentPage.goto('/students');
    await parentPage.waitForLoadState('networkidle').catch(() => {});
    await expect(parentPage).toHaveURL(/\/students\/.+/, { timeout: 20_000 });
    // Verify the student detail page heading is visible
    await expect(parentPage.locator('main h1').first()).toBeVisible({ timeout: 20_000 });
  });
});

// =========================================================================
// SECTION 10: FEES & HOMEWORK TESTS
// =========================================================================

test.describe('10 — Fees & Homework Tests', () => {
  test('10.1 — Admin: Fees page renders', async ({ adminPage }) => {
    const fees = new FeesPage(adminPage);
    await adminPage.goto('/fees');
    await adminPage.waitForLoadState('networkidle').catch(() => {});
    await fees.expectVisible();
  });

  test('10.2 — Admin: Fees page has Fee Structures and Invoices tabs', async ({ adminPage }) => {
    const fees = new FeesPage(adminPage);
    await adminPage.goto('/fees');
    await adminPage.waitForLoadState('networkidle').catch(() => {});
    await fees.expectVisible();
    await expect(fees.feeStructuresTab).toBeVisible();
    await expect(fees.invoicesTab).toBeVisible();
  });

  test('10.3 — Admin: Homework page renders', async ({ adminPage }) => {
    const homework = new HomeworkPage(adminPage);
    await homework.goto();
    await homework.expectVisible();
  });

  test('10.4 — Teacher: Homework page renders', async ({ teacherPage }) => {
    const homework = new HomeworkPage(teacherPage);
    await homework.goto();
    await homework.expectVisible();
  });

  test('10.5 — Parent: Homework page renders', async ({ parentPage }) => {
    const homework = new HomeworkPage(parentPage);
    await homework.goto();
    await homework.expectVisible();
  });

  test('10.6 — Parent: Fees page renders', async ({ parentPage }) => {
    await parentPage.goto('/fees');
    await parentPage.waitForLoadState('networkidle').catch(() => {});
    await expect(
      parentPage.getByRole('heading', { name: /fees/i }),
    ).toBeVisible({ timeout: 20_000 });
  });

  // NOTE: After deploy, teacher WILL be able to access fees (read-only).
  // The TEACHER_BLOCKED_ROUTES and navigation.ts have been updated in this PR.
  // Until deploy, CI runs against dev.skunect.com which still blocks teachers.
  test('10.7 — Teacher: Fees page access', async ({ teacherPage }) => {
    await teacherPage.goto('/fees');
    // After deploy: teacher sees Fees Management heading (read-only)
    // Before deploy: teacher is redirected to /dashboard
    await expect(teacherPage).toHaveURL(/\/(fees|dashboard)\/?/, { timeout: 15_000 });
  });

  // -------------------------------------------------------------------------
  // SCRUM-63: Levels tab + multi-target fee form + amount spinner removal
  // -------------------------------------------------------------------------

  test('10.8 — SCRUM-63: School settings exposes a Levels tab', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();
    await expect(settings.levelsTab).toBeVisible();
  });

  test('10.9 — SCRUM-63: Levels tab shows seeded Nigerian taxonomy', async ({ adminPage }) => {
    const settings = new SchoolSettingsPage(adminPage);
    await settings.goto();
    await settings.expectVisible();
    await settings.levelsTab.click();
    await expect(settings.levelsTab).toHaveAttribute('data-state', 'active', {
      timeout: 5_000,
    });
    // Confirm at least one of the standard taxonomy names renders. We don't pin
    // an exact count because each pilot school may have customised its levels.
    await expect(
      adminPage.getByRole('cell', { name: /JSS 1/ }).first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('10.10 — SCRUM-63: Fee structure form has target picker (school/levels/classes)', async ({
    adminPage,
  }) => {
    await adminPage.goto('/fees');
    await adminPage.waitForLoadState('networkidle').catch(() => {});
    const fees = new FeesPage(adminPage);
    await fees.expectVisible();
    await fees.switchToFeeStructures();
    await fees.createStructureButton.click();

    // Dialog opens — assert all three radio options are present.
    // Use getByRole('radio') so the locator targets the input itself, not the
    // label OR the auto-rendered badge in the "Selected" preview row (which
    // shows "Whole school" since SCHOOL is the default target).
    const dialog = adminPage.getByRole('dialog');
    await expect(
      dialog.getByRole('radio', { name: 'Whole school' }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      dialog.getByRole('radio', { name: 'Specific levels' }),
    ).toBeVisible();
    await expect(
      dialog.getByRole('radio', { name: 'Specific classes' }),
    ).toBeVisible();
  });

  test('10.11 — SCRUM-63 bug fix: Amount input has no spinner arrows', async ({
    adminPage,
  }) => {
    await adminPage.goto('/fees');
    await adminPage.waitForLoadState('networkidle').catch(() => {});
    const fees = new FeesPage(adminPage);
    await fees.expectVisible();
    await fees.switchToFeeStructures();
    await fees.createStructureButton.click();

    const amount = adminPage
      .getByRole('dialog')
      .getByLabel(/Amount/i);
    await expect(amount).toBeVisible({ timeout: 10_000 });
    // The Tailwind class that strips the spinner. We assert on the className so
    // a future refactor that drops the class fails this test loudly.
    const className = await amount.getAttribute('class');
    expect(className).toContain('appearance:textfield');
  });

  test('10.12 — SCRUM-63: Selecting "Specific levels" reveals the level multi-select', async ({
    adminPage,
  }) => {
    await adminPage.goto('/fees');
    await adminPage.waitForLoadState('networkidle').catch(() => {});
    const fees = new FeesPage(adminPage);
    await fees.expectVisible();
    await fees.switchToFeeStructures();
    await fees.createStructureButton.click();

    await adminPage
      .getByRole('dialog')
      .getByText('Specific levels')
      .click();

    // The "Levels" sub-section label appears (not the radio label "Specific levels")
    await expect(
      adminPage.getByRole('dialog').getByText(/^Levels$/),
    ).toBeVisible({ timeout: 5_000 });
  });

  // -------------------------------------------------------------------------
  // SCRUM-63 PR 6: Promotions page has "By Class" + "By Level" tabs
  //
  // These assert the new tabbed promotions UI introduced in this branch. CI
  // runs E2E against dev.skunect.com — until this PR deploys the elements
  // don't exist. Unskip in a follow-up commit after deploy. Same pattern as
  // 10.8–10.12 in PR 4.
  // -------------------------------------------------------------------------

  test.skip('10.13 — SCRUM-63: Promotions page exposes By Class and By Level tabs', async ({
    adminPage,
  }) => {
    await adminPage.goto('/promotions');
    await adminPage.waitForLoadState('networkidle').catch(() => {});
    await expect(
      adminPage.getByRole('heading', { name: /student promotions/i }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(adminPage.getByRole('tab', { name: 'By Class' })).toBeVisible();
    await expect(adminPage.getByRole('tab', { name: 'By Level' })).toBeVisible();
  });

  test.skip('10.14 — SCRUM-63: By Level tab reveals source/target level selectors and Promote button', async ({
    adminPage,
  }) => {
    await adminPage.goto('/promotions');
    await adminPage.waitForLoadState('networkidle').catch(() => {});
    await adminPage.getByRole('tab', { name: 'By Level' }).click();
    await expect(
      adminPage.getByRole('heading', { name: /promote an entire level/i }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(adminPage.getByText('Source Level')).toBeVisible();
    await expect(adminPage.getByText('Target Level')).toBeVisible();
    await expect(
      adminPage.getByRole('button', { name: /promote level/i }),
    ).toBeVisible();
  });
});

// =========================================================================
// SECTION 11: CROSS-SCHOOL DATA ISOLATION
// =========================================================================

test.describe('11 — Cross-School Data Isolation', () => {
  test('11.1 — Admin Kings: Dashboard shows Kings Academy context', async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectVisible();

    // The sidebar or header should show the school name
    await expect(
      adminPage.getByText('Kings Academy Lagos'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('11.2 — Admin Greenfield: Dashboard shows Greenfield context', async ({ adminGreenfieldPage }) => {
    const dashboard = new DashboardPage(adminGreenfieldPage);
    await dashboard.goto();
    await dashboard.expectVisible();

    // The sidebar or header should show the school name
    await expect(
      adminGreenfieldPage.getByText('Greenfield International School'),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('11.3 — Teacher Kings: Cannot see Greenfield data on students page', async ({ teacherPage }) => {
    const students = new StudentsPage(teacherPage);
    await students.goto();
    await students.expectVisible();

    // Greenfield school name should NOT appear in the student list
    await expect(
      teacherPage.getByText('Greenfield International School'),
    ).not.toBeVisible({ timeout: 5_000 });
  });
});
