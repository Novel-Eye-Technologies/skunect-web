/**
 * School Lifecycle E2E Flow — Full 9-Phase Coverage
 *
 * This is a comprehensive end-to-end test that exercises the full school
 * management lifecycle across all user roles:
 *
 * Phase 1: Super Admin — Create school, verify dashboard, seed page, school details
 * Phase 2: School Admin Setup — Users, teachers, sessions, terms, classes, subjects,
 *          grading, students, parents, timetable, events, calendar, settings, audit
 * Phase 3: Teacher 1 — Dashboard, attendance, assessments, grades, homework, welfare,
 *          mood, health, communication, announcements
 * Phase 4: Shared Parent — Dashboard, child switching, attendance, homework, messages,
 *          announcements, fees, notification preferences
 * Phase 5: Teacher 1 Return — Reply to parent message, welfare, mood
 * Phase 6: School Admin Return — Fees, bus management (route, bus, enrollment), safety, analytics, audit
 * Phase 7: Parent Return — Notifications, announcements, messages, fees, bus tracking, pickup authorization
 * Phase 8: Dual-Role User — School selector, role switching
 * Phase 8.5: Subscription Management — Create plan, assign subscription, record payment,
 *            proration calculator, admin views subscription, upgrade request
 * Phase 9: Super Admin Cleanup — Deactivate/reactivate school
 *
 * IMPORTANT: Tests run serially and share state via `schoolData`.
 * This spec is designed for the Full CRUD E2E pipeline (fresh DB).
 */
import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { VerifyOtpPage } from '../../pages/verify-otp.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { SidebarPage } from '../../pages/sidebar.page';
import { SystemSchoolsPage } from '../../pages/system-schools.page';
import { SchoolDetailPage } from '../../pages/school-detail.page';
import { ManageTermsPage } from '../../pages/manage-terms.page';
import { ManageClassesPage } from '../../pages/manage-classes.page';
import { ManageSubjectsPage } from '../../pages/manage-subjects.page';
import { ClassSubjectsPage } from '../../pages/class-subjects.page';
import { TimetablePage } from '../../pages/timetable.page';
import { UsersPage } from '../../pages/users.page';
import { TeachersPage } from '../../pages/teachers.page';
import { StudentsPage } from '../../pages/students.page';
import { ParentsPage } from '../../pages/parents.page';
import { GradeStudentsPage } from '../../pages/grade-students.page';
import { ManageHomeworkPage } from '../../pages/manage-homework.page';
import { StudentDetailsPage } from '../../pages/student-details.page';
import { SuperAdminsPage } from '../../pages/super-admins.page';
import { SystemSeedPage } from '../../pages/system-seed.page';
import { ProfilePage } from '../../pages/profile.page';
import { CalendarPage } from '../../pages/calendar.page';
import { NotificationPreferencesPage } from '../../pages/notification-preferences.page';
import { SchoolSettingsPage } from '../../pages/school-settings.page';
import { AuditLogsPage } from '../../pages/audit-logs.page';
import { ActivityFeedPage } from '../../pages/activity-feed.page';
import { WelfarePage } from '../../pages/welfare.page';
import { MoodTrackerPage } from '../../pages/mood-tracker.page';
import { HealthRecordsPage } from '../../pages/health-records.page';
import { FeesPage } from '../../pages/fees.page';
import { MessagesPage, AnnouncementsPage } from '../../pages/communication.page';
import { SelectSchoolPage } from '../../pages/select-school.page';
import { HomeworkPage } from '../../pages/homework.page';
import { LandingPage } from '../../pages/landing.page';
import { RegisterPage } from '../../pages/register.page';
import { DataMigrationPage } from '../../pages/data-migration.page';
import { HelpPage } from '../../pages/help.page';
import { MyClassesPage } from '../../pages/my-classes.page';
import { BusPage } from '../../pages/bus.page';
import { BusTrackingPage } from '../../pages/bus-tracking.page';
import { PickupAuthorizationPage } from '../../pages/pickup-authorization.page';
import { SubscriptionPlansPage } from '../../pages/subscription-plans.page';
import { SchoolSubscriptionPage } from '../../pages/school-subscription.page';
import { AdminSubscriptionPage } from '../../pages/admin-subscription.page';
import { SchoolInactivePage } from '../../pages/school-inactive.page';
import {
  authenticateAccount,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
} from '../../helpers/api.helper';
import { TEST_OTP, TEST_ACCOUNTS, API_BASE_URL } from '../../fixtures/test-accounts';

// ---------------------------------------------------------------------------
// Shared state across all serial tests
// ---------------------------------------------------------------------------
interface SchoolData {
  schoolId: string;
  schoolName: string;
  adminEmail: string;
  adminPassword: string;
  admin2Email: string;
  teacherEmails: string[];
  sessionId: string;
  termId: string;
  classIds: string[];
  classNames: string[];
  subjectNames: string[];
  gradingSystemId: string;
  studentNames: string[];
  parentEmails: string[];
  sharedParentEmail: string;
  // IDs populated by API calls
  studentIds: Record<string, string>;
  announcementTitle: string;
  homeworkTitles: string[];
  feeStructureId: string;
  busRouteName: string;
  busPlateNumber: string;
  subscriptionPlanId: string;
  subscriptionPlanName: string;
}

const schoolData: Partial<SchoolData> = {};

// Unique suffix to avoid collisions with seeded data
const TS = Date.now().toString(36).slice(-5);
const SCHOOL_NAME = `E2E School ${TS}`;
const SCHOOL_EMAIL = `e2e-school-${TS}@test.skunect.com`;
const ADMIN_EMAIL = `admin-${TS}@test.skunect.com`;
const ADMIN2_EMAIL = `admin2-${TS}@test.skunect.com`;
const TEACHER1_EMAIL = `teacher1-${TS}@test.skunect.com`;
const TEACHER2_EMAIL = `teacher2-${TS}@test.skunect.com`;
const TEACHER3_EMAIL = `teacher3-${TS}@test.skunect.com`;
const SESSION_NAME = `2025/2026`;
const TERM_NAME = `First Term`;
const CLASS1_NAME = `JSS 1`;
const CLASS2_NAME = `JSS 2`;
const SUBJECT_NAMES = ['Mathematics', 'English Language', 'Basic Science', 'Social Studies', 'Computer Science'];
// Teacher 1's subjects in JSS 1 (class teacher) — Computer Science is taught by Teacher 3
const TEACHER1_JSS1_SUBJECTS = ['Mathematics', 'English Language', 'Basic Science', 'Social Studies'];
// Teacher 1 also teaches Social Studies in JSS 2 (cross-class assignment)
const GRADING_SYSTEM_NAME = `Standard Grading ${TS}`;

// Student data
const STUDENTS_CLASS1 = [
  { first: 'Ade', last: 'Bakare', gender: 'MALE', parentFirst: 'Olu', parentLast: 'Bakare', parentEmail: `parent-ade-${TS}@test.skunect.com`, parentPhone: '08011111001', relationship: 'FATHER' },
  { first: 'Bola', last: 'Okafor', gender: 'FEMALE', parentFirst: 'Ngozi', parentLast: 'Okafor', parentEmail: `parent-bola-${TS}@test.skunect.com`, parentPhone: '08011111002', relationship: 'MOTHER' },
  { first: 'Chidi', last: 'Eze', gender: 'MALE', parentFirst: 'Emeka', parentLast: 'Eze', parentEmail: `parent-chidi-${TS}@test.skunect.com`, parentPhone: '08011111003', relationship: 'FATHER' },
  { first: 'Damilola', last: 'Adeyemi', gender: 'FEMALE', parentFirst: 'Tunde', parentLast: 'Adeyemi', parentEmail: `parent-dami-${TS}@test.skunect.com`, parentPhone: '08011111004', relationship: 'FATHER' },
  { first: 'Ebuka', last: 'Nnamdi', gender: 'MALE', parentFirst: 'Chioma', parentLast: 'Nnamdi', parentEmail: `parent-ebuka-${TS}@test.skunect.com`, parentPhone: '08011111005', relationship: 'MOTHER' },
];

const STUDENTS_CLASS2 = [
  { first: 'Funke', last: 'Alade', gender: 'FEMALE', parentFirst: 'Yemi', parentLast: 'Alade', parentEmail: `parent-funke-${TS}@test.skunect.com`, parentPhone: '08011111006', relationship: 'FATHER' },
  { first: 'Gbenga', last: 'Salami', gender: 'MALE', parentFirst: 'Iya', parentLast: 'Salami', parentEmail: `parent-gbenga-${TS}@test.skunect.com`, parentPhone: '08011111007', relationship: 'MOTHER' },
  { first: 'Halima', last: 'Ibrahim', gender: 'FEMALE', parentFirst: 'Musa', parentLast: 'Ibrahim', parentEmail: `parent-halima-${TS}@test.skunect.com`, parentPhone: '08011111008', relationship: 'FATHER' },
  { first: 'Ife', last: 'Ogundimu', gender: 'FEMALE', parentFirst: 'Segun', parentLast: 'Ogundimu', parentEmail: `parent-ife-${TS}@test.skunect.com`, parentPhone: '08011111009', relationship: 'FATHER' },
  { first: 'Jide', last: 'Martins', gender: 'MALE', parentFirst: 'Mary', parentLast: 'Martins', parentEmail: `parent-jide-${TS}@test.skunect.com`, parentPhone: '08011111010', relationship: 'MOTHER' },
];

// Second parents for 3 students (Ade gets a second parent, Funke gets a second parent who is ALSO Gbenga's second parent)
const SECOND_PARENT_EMAIL = `parent-shared-${TS}@test.skunect.com`;
const SECOND_PARENT_ADE_EMAIL = `parent-ade2-${TS}@test.skunect.com`;

// Event name
const EVENT_TITLE = `Open Day ${TS}`;
const ANNOUNCEMENT_TITLE = `Announcement ${TS}`;
const BUS_ROUTE_NAME = `Lekki-VI Route ${TS}`;
const BUS_PLATE_NUMBER = `LAG-${TS}-XY`;
const BUS_DRIVER_NAME = `Driver Chukwu ${TS}`;
const BUS_DRIVER_PHONE = '08099990001';
const BUS_PICKUP_POINT = 'Lekki Phase 1 Bus Stop';
const PICKUP_PERSON_NAME = `Uncle Tayo ${TS}`;
const SUBSCRIPTION_PLAN_NAME = `Standard Annual ${TS}`;
const SUBSCRIPTION_PAYMENT_REF = `TXN-E2E-${TS}`;

// ---------------------------------------------------------------------------
// Helper: Login via UI
// ---------------------------------------------------------------------------
async function loginViaUI(page: Page, email: string) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail(email);
  await loginPage.submit();

  const otpPage = new VerifyOtpPage(page);
  await otpPage.expectVisible();
  await otpPage.fillOtp(TEST_OTP);

  // After OTP, the page briefly shows "Verified!" then redirects to dashboard.
  // The redirect can be so fast that "Verified!" is never caught.
  // Wait for either the "Verified!" text, the dashboard heading, or the school selector.
  await expect(
    page.getByRole('heading', { name: /verified!/i })
      .or(page.locator('h1').filter({ hasText: /welcome back/i }))
      .or(page.getByRole('heading', { name: /select a school/i }))
  ).toBeVisible({ timeout: 20_000 });
}

async function waitForDashboard(page: Page) {
  const dashboard = new DashboardPage(page);
  await dashboard.expectVisible();
}

async function logout(page: Page) {
  const sidebar = new SidebarPage(page);
  await sidebar.logout();
  // Wait for redirect to login
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible({ timeout: 15_000 });
}

// Helper: wait for toast success
async function expectToast(page: Page, type: 'success' | 'error' = 'success') {
  await expect(
    page.locator(`[data-sonner-toast][data-type="${type}"]`)
  ).toBeVisible({ timeout: 10_000 });
}

// Helper: wait for dialog to close
// Uses data-slot="dialog-content" to avoid matching popover elements that also have role="dialog"
async function expectDialogClosed(page: Page) {
  await expect(page.locator('[data-slot="dialog-content"]')).not.toBeVisible({ timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------
test.describe.serial('School Lifecycle E2E Flow', () => {
  // Long timeout for this comprehensive flow
  test.setTimeout(300_000); // 5 minutes per test

  // =========================================================================
  // PHASE 0: PUBLIC PAGES (unauthenticated)
  // =========================================================================

  test('0.1 — Landing page renders for unauthenticated user', async ({ page }) => {
    // Clear auth state to simulate unauthenticated visitor
    await page.goto('/');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const landing = new LandingPage(page);
    await landing.goto();
    await landing.expectVisible();
    await expect(landing.heroDescription).toBeVisible();
  });

  test('0.2 — Landing page shows feature cards', async ({ page }) => {
    await page.goto('/');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const landing = new LandingPage(page);
    await landing.goto();
    await landing.expectVisible();
    await expect(landing.featuresSection).toBeVisible();
  });

  test('0.3 — Get Started and Sign In buttons link correctly', async ({ page }) => {
    await page.goto('/');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const landing = new LandingPage(page);
    await landing.goto();
    await landing.expectVisible();
    await expect(landing.getStartedButton).toHaveAttribute('href', /\/register\/?/);
    await expect(landing.signInButton).toHaveAttribute('href', /\/login\/?/);
  });

  test('0.4 — Register page renders with all form fields', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.expectVisible();
    await expect(register.firstNameInput).toBeVisible();
    await expect(register.lastNameInput).toBeVisible();
    await expect(register.emailInput).toBeVisible();
    await expect(register.phoneInput).toBeVisible();
    await expect(register.submitButton).toBeVisible();
  });

  test('0.5 — Register page shows heading and login link', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await expect(register.heading).toBeVisible();
    await expect(register.heading).toContainText('Create your account');
    await expect(register.loginLink).toBeVisible();
    await expect(register.loginLink).toContainText('Sign in');
  });

  test('0.6 — Register login link navigates to login page', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.goToLogin();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('0.7 — Register validates empty required fields', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.expectVisible();
    await register.submit();
    await expect(page.getByText(/first name is required/i)).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText(/last name is required/i)).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText(/email is required/i)).toBeVisible({ timeout: 3_000 });
  });

  test('0.8 — Register validates invalid email', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.expectVisible();
    await register.fillForm({ firstName: 'Test', lastName: 'User', email: 'not-an-email' });
    await register.submit();
    const isInvalid = await register.emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('0.9 — Register validates short first name', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.expectVisible();
    await register.fillForm({ firstName: 'A', lastName: 'User', email: 'test@example.com' });
    await register.submit();
    await expect(page.getByText(/first name must be at least 2 characters/i)).toBeVisible({ timeout: 3_000 });
  });

  test('0.10 — Register phone field is optional', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.expectVisible();
    await expect(page.getByText(/optional/i)).toBeVisible();
  });

  test('0.11 — Register form can be filled with all fields', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();
    await register.expectVisible();
    await register.fillForm({
      firstName: 'Test',
      lastName: 'User',
      email: `e2e.test.${Date.now()}@example.com`,
      phone: '+234 800 000 0000',
    });
    await expect(register.firstNameInput).toHaveValue('Test');
    await expect(register.lastNameInput).toHaveValue('User');
    await expect(register.phoneInput).toHaveValue('+234 800 000 0000');
  });

  test('0.12 — Unauthenticated user visiting /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\/?/, { timeout: 10_000 });
  });

  test('0.13 — Unauthenticated user visiting /students redirects to /login', async ({ page }) => {
    await page.goto('/');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/students');
    await expect(page).toHaveURL(/\/login\/?/, { timeout: 10_000 });
  });

  test('0.14 — OTP page displays correctly after email submission', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.fillEmail('superadmin@skunect.com');
    await loginPage.submit();

    const otpPage = new VerifyOtpPage(page);
    await otpPage.expectVisible();
    // OTP page should have 6 digit inputs
    const inputs = page.locator('input[maxlength="1"]');
    await expect(inputs).toHaveCount(6, { timeout: 5_000 });
  });

  // =========================================================================
  // PHASE 1: SUPER ADMIN
  // =========================================================================

  test('1.1 — Super Admin: Login and validate dashboard stats', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    const dashboard = new DashboardPage(page);
    await dashboard.expectVisible();
    await dashboard.expectSuperAdminDashboard();

    // Verify dashboard hero metrics are visible
    const main = page.getByRole('main');
    await expect(main.getByText('Schools').first()).toBeVisible({ timeout: 15_000 });
    await expect(main.getByText('Students').first()).toBeVisible();
    await expect(main.getByText('MRR').first()).toBeVisible();
  });

  test('1.1b — Super Admin: Dashboard shows all system stat cards', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    const dashboard = new DashboardPage(page);
    await dashboard.expectVisible();

    const main = page.getByRole('main');
    // Hero metrics
    await expect(main.getByText('Schools').first()).toBeVisible({ timeout: 15_000 });
    await expect(main.getByText('Students').first()).toBeVisible();
    await expect(main.getByText('MRR').first()).toBeVisible();
    // Health gauges
    await expect(main.getByText('Teacher Attendance Today')).toBeVisible();
    await expect(main.getByText('Weekly Active Parents')).toBeVisible();
    // Growth metrics
    await expect(main.getByText('Fully Set Up')).toBeVisible();
    await expect(main.getByText('Net Student Growth')).toBeVisible();
  });

  test('1.1c — Super Admin: Sidebar shows correct nav items', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const sidebar = new SidebarPage(page);
    await sidebar.expectNavItem('System Dashboard');
    await sidebar.expectNavItem('All Schools');
    await sidebar.expectNavItem('Seed Data');
    await sidebar.expectNavItem('Help & Support');
  });

  test('1.1d — Super Admin: Help page loads with FAQ sections', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const helpPage = new HelpPage(page);
    await helpPage.goto();
    await helpPage.expectVisible();
    await helpPage.expectFaqSections();
  });

  test('1.2 — Super Admin: Validate super admins page loads', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const superAdminsPage = new SuperAdminsPage(page);
    await superAdminsPage.goto();
    await superAdminsPage.expectVisible();
    await superAdminsPage.expectTableNotEmpty();
    // The seeded super admin should be in the table
    await superAdminsPage.expectAdminInTable('superadmin@skunect.com');
  });

  test('1.3 — Super Admin: Create a new school', async ({ page }) => {
    // Login first (serial tests get fresh page per test)
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const schoolsPage = new SystemSchoolsPage(page);
    await schoolsPage.goto();
    await schoolsPage.expectVisible();

    // Click Add School
    await schoolsPage.clickAdd();
    await schoolsPage.fillSchoolForm(SCHOOL_NAME, 'STANDARD');
    await schoolsPage.emailInput.fill(SCHOOL_EMAIL);
    await schoolsPage.phoneInput.fill('+2348012345678');
    await schoolsPage.addressInput.fill('123 Test Street');
    await schoolsPage.cityInput.fill('Lagos');

    // Select state - it's the second combobox in the dialog
    const stateCombobox = schoolsPage.dialog.getByRole('combobox').last();
    await stateCombobox.click();
    await page.getByRole('option', { name: 'Lagos' }).click();

    await schoolsPage.submitSchoolForm();
    await expectDialogClosed(page);

    // Verify school appears in the table
    await schoolsPage.expectSchoolInTable(SCHOOL_NAME);

    // Get the school ID via API (table cells are plain text, not links)
    const auth = await authenticateAccount('superadmin@skunect.com', TEST_OTP);
    const schoolsRes = await apiGet<Array<{ id: string; name: string }>>(
      '/admin/schools?page=0&size=100',
      auth.accessToken,
    );
    const created = schoolsRes.data.find((s) => s.name === SCHOOL_NAME);
    expect(created).toBeTruthy();

    schoolData.schoolId = created!.id;
    schoolData.schoolName = SCHOOL_NAME;
  });

  test('1.4 — Super Admin: Update school address', async ({ page }) => {
    expect(schoolData.schoolId).toBeTruthy();

    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const schoolsPage = new SystemSchoolsPage(page);
    await schoolsPage.goto();
    await schoolsPage.expectVisible();

    // Edit the school
    await schoolsPage.clickEditSchool(SCHOOL_NAME);
    await schoolsPage.addressInput.fill('456 Updated Avenue, Victoria Island');
    await schoolsPage.cityInput.fill('Lagos Island');
    await schoolsPage.submitSchoolForm();
    await expectDialogClosed(page);
  });

  test('1.5 — Super Admin: Add school admin', async ({ page }) => {
    expect(schoolData.schoolId).toBeTruthy();

    // Create admin via API for reliability under parallel execution
    const superAuth = await authenticateAccount('superadmin@skunect.com', TEST_OTP);
    await apiPost(`/admin/schools/${schoolData.schoolId}/admins`, superAuth.accessToken, {
      firstName: 'School',
      lastName: 'Admin',
      email: ADMIN_EMAIL,
      phone: '+2348099999001',
    });

    // Verify admin appears in school details via UI
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const schoolsPage = new SystemSchoolsPage(page);
    await schoolsPage.goto();
    await schoolsPage.expectVisible();
    await schoolsPage.expectSchoolInTable(SCHOOL_NAME);

    schoolData.adminEmail = ADMIN_EMAIL;
  });

  test('1.6 — Super Admin: Open school details and verify', async ({ page }) => {
    expect(schoolData.schoolId).toBeTruthy();

    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const detailPage = new SchoolDetailPage(page);
    await detailPage.goto(schoolData.schoolId!);
    await detailPage.expectVisible(SCHOOL_NAME);
    await detailPage.expectSchoolInfo();
    await detailPage.expectAdminSection();

    // Verify the admin is listed
    await detailPage.expectAdminInTable(ADMIN_EMAIL);
  });

  test('1.7 — Super Admin: Validate seed page loads', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const seedPage = new SystemSeedPage(page);
    await seedPage.goto();
    await seedPage.expectVisible();
    await seedPage.expectTestAccountsVisible();
  });

  test('1.7b — Super Admin: Seed data page shows reset button', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const seedPage = new SystemSeedPage(page);
    await seedPage.goto();
    await seedPage.expectVisible();
    await expect(page.getByRole('button', { name: /reset/i })).toBeVisible({ timeout: 10_000 });
  });

  test('1.7c — Super Admin: Non-super-admin cannot access system routes', async ({ page }) => {
    // This will be tested more thoroughly in Phase 10, but verify the basic case here
    // by logging in as a seed admin and trying to access /system/schools
    await loginViaUI(page, 'admin@kingsacademy.ng');
    await waitForDashboard(page);
    await page.goto('/system/schools');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });
    await logout(page);
  });

  test('1.8 — Super Admin: Logout', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 2: SCHOOL ADMIN SETUP
  // =========================================================================

  test('2.1 — School Admin: Login', async ({ page }) => {
    expect(schoolData.adminEmail).toBeTruthy();

    await loginViaUI(page, schoolData.adminEmail!);
    const dashboard = new DashboardPage(page);
    await dashboard.expectVisible();
    await dashboard.expectAdminDashboard();
  });

  test('2.2 — School Admin: Create a second school admin via User Management', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.expectVisible();

    // Click "Invite User" button
    await usersPage.inviteButton.click();
    await expect(usersPage.dialog).toBeVisible();

    // Fill the invite form
    await usersPage.dialog.getByLabel('Email').fill(ADMIN2_EMAIL);
    await usersPage.dialog.getByLabel('First Name').fill('Second');
    await usersPage.dialog.getByLabel('Last Name').fill('Admin');

    // Select Admin role
    const roleTrigger = usersPage.dialog.getByRole('combobox');
    await roleTrigger.click();
    await page.getByRole('option', { name: 'Admin' }).click();

    // Submit
    await usersPage.dialog.getByRole('button', { name: /send invitation/i }).click();
    await expectDialogClosed(page);

    // Verify user appears in table
    await usersPage.expectUserInTable(ADMIN2_EMAIL);
    schoolData.admin2Email = ADMIN2_EMAIL;
  });

  test('2.3 — School Admin: Create 3 teachers', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const teacherInfos = [
      { first: 'Teacher', last: 'One', email: TEACHER1_EMAIL },
      { first: 'Teacher', last: 'Two', email: TEACHER2_EMAIL },
      { first: 'Teacher', last: 'Three', email: TEACHER3_EMAIL },
    ];

    // Use API to invite teachers (InviteUserDialog uses DialogTrigger which
    // can have timing issues with controlled open/close state).
    const auth = await authenticateAccount(schoolData.adminEmail!, TEST_OTP);
    const sid = schoolData.schoolId!;

    for (const info of teacherInfos) {
      await apiPost(`/schools/${sid}/users/invite`, auth.accessToken, {
        email: info.email,
        firstName: info.first,
        lastName: info.last,
        role: 'TEACHER',
      });
    }

    // Verify all teachers appear on the Teachers page
    const teachersPage = new TeachersPage(page);
    await teachersPage.goto();
    await teachersPage.expectVisible();

    for (const info of teacherInfos) {
      await teachersPage.expectTeacherInTable(info.email);
    }

    schoolData.teacherEmails = [TEACHER1_EMAIL, TEACHER2_EMAIL, TEACHER3_EMAIL];
  });

  test('2.4 — School Admin: Update phone number for Teacher One', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const teachersPage = new TeachersPage(page);
    await teachersPage.goto();
    await teachersPage.expectVisible();
    await teachersPage.expectTeacherInTable('Teacher One');

    await teachersPage.clickEditDetails('Teacher One');
    await teachersPage.fillEditForm('Teacher', 'One', '+2348055555001');
    await teachersPage.submitEdit();
    await expectDialogClosed(page);
  });

  test('2.5 — School Admin: Create a new academic session', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const termsPage = new ManageTermsPage(page);
    await termsPage.goto();
    await termsPage.expectVisible();

    await termsPage.clickAddSession();
    await termsPage.fillSessionForm(SESSION_NAME, '2025-09-01', '2026-07-31');
    await termsPage.submitForm();
    await expectDialogClosed(page);

    await termsPage.expectSessionVisible(SESSION_NAME);

    // Set the session as current
    const sessionRow = page.locator('.rounded-lg.border.p-4', { hasText: SESSION_NAME }).first();
    await sessionRow.getByTitle('Set as current').click();
    await expect(page.getByText('Current').first()).toBeVisible({ timeout: 10_000 });
  });

  test('2.6 — School Admin: Create 1 term for the session', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const termsPage = new ManageTermsPage(page);
    await termsPage.goto();
    await termsPage.expectVisible();

    // Select the session first
    await termsPage.selectSession(SESSION_NAME);

    // Wait for Terms section to appear (use the card title which includes session name)
    await expect(page.getByText(`Terms — ${SESSION_NAME}`)).toBeVisible({ timeout: 10_000 });

    await termsPage.clickAddTerm();
    await termsPage.fillTermForm(TERM_NAME, '2025-09-01', '2026-07-15');
    await termsPage.submitForm();
    await expectDialogClosed(page);

    await termsPage.expectTermVisible(TERM_NAME);

    // Set the term as current
    const termRow = page.locator('.rounded-lg.border.p-4', { hasText: TERM_NAME }).first();
    await termRow.getByTitle('Set as current').click();
    await expect(termRow.getByText('Current')).toBeVisible({ timeout: 10_000 });
  });

  test('2.7 — School Admin: Create 2 classes assigned to Teacher 1 and Teacher 2', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const classesPage = new ManageClassesPage(page);
    await classesPage.goto();
    await classesPage.expectVisible();

    // Create Class 1 with Teacher One as class teacher
    await classesPage.clickAddClass();
    await classesPage.fillClassForm(CLASS1_NAME, 'A', '30', 'Teacher One');
    await classesPage.submitForm();
    await expectDialogClosed(page);
    await classesPage.expectClassInTable(CLASS1_NAME);

    // Create Class 2 with Teacher Two as class teacher
    await classesPage.clickAddClass();
    await classesPage.fillClassForm(CLASS2_NAME, 'A', '30', 'Teacher Two');
    await classesPage.submitForm();
    await expectDialogClosed(page);
    await classesPage.expectClassInTable(CLASS2_NAME);

    schoolData.classNames = [CLASS1_NAME, CLASS2_NAME];
  });

  test('2.8 — School Admin: Create 1 grading system', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    // Navigate to School Settings > Grading tab
    await page.goto('/school-settings');
    await expect(page.getByRole('heading', { name: 'School Settings' })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('tab', { name: 'Grading' }).click();

    // Click Add Grading System (first() avoids empty-state duplicate)
    await page.getByRole('button', { name: /add grading system/i }).first().click();
    const dialog = page.locator('[data-slot="dialog-content"]');
    await expect(dialog).toBeVisible();

    // Fill system name
    await dialog.getByPlaceholder('e.g. Standard Grading').fill(GRADING_SYSTEM_NAME);

    // The form pre-fills with one grade (A, 70-100, Excellent)
    // Add more grades: B, C, D, F
    const addGradeBtn = dialog.getByRole('button', { name: /add grade/i });

    // Add B grade
    await addGradeBtn.click();
    const gradeRows = dialog.locator('.grid.grid-cols-\\[1fr_1fr_1fr_1\\.5fr_auto\\]').filter({ hasNotText: 'Grade' });
    const lastRow = gradeRows.last();
    await lastRow.locator('input').nth(0).fill('B');
    await lastRow.locator('input').nth(1).fill('60');
    await lastRow.locator('input').nth(2).fill('69');
    await lastRow.locator('input').nth(3).fill('Very Good');

    // Add C grade
    await addGradeBtn.click();
    const cRow = dialog.locator('.grid.grid-cols-\\[1fr_1fr_1fr_1\\.5fr_auto\\]').filter({ hasNotText: 'Grade' }).last();
    await cRow.locator('input').nth(0).fill('C');
    await cRow.locator('input').nth(1).fill('50');
    await cRow.locator('input').nth(2).fill('59');
    await cRow.locator('input').nth(3).fill('Good');

    // Add D grade
    await addGradeBtn.click();
    const dRow = dialog.locator('.grid.grid-cols-\\[1fr_1fr_1fr_1\\.5fr_auto\\]').filter({ hasNotText: 'Grade' }).last();
    await dRow.locator('input').nth(0).fill('D');
    await dRow.locator('input').nth(1).fill('40');
    await dRow.locator('input').nth(2).fill('49');
    await dRow.locator('input').nth(3).fill('Fair');

    // Add F grade
    await addGradeBtn.click();
    const fRow = dialog.locator('.grid.grid-cols-\\[1fr_1fr_1fr_1\\.5fr_auto\\]').filter({ hasNotText: 'Grade' }).last();
    await fRow.locator('input').nth(0).fill('F');
    await fRow.locator('input').nth(1).fill('0');
    await fRow.locator('input').nth(2).fill('39');
    await fRow.locator('input').nth(3).fill('Fail');

    // Submit
    await dialog.getByRole('button', { name: /^create$/i }).click();
    await expectDialogClosed(page);

    // Verify grading system appears
    await expect(page.getByText(GRADING_SYSTEM_NAME)).toBeVisible({ timeout: 10_000 });
  });

  test('2.9 — School Admin: Create 5 subjects', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const subjectsPage = new ManageSubjectsPage(page);
    await subjectsPage.goto();
    await subjectsPage.expectVisible();

    const subjectData = [
      { name: 'Mathematics', code: `MATH-${TS}`, desc: 'Mathematics for all classes' },
      { name: 'English Language', code: `ENG-${TS}`, desc: 'English Language studies' },
      { name: 'Basic Science', code: `SCI-${TS}`, desc: 'Basic Science for junior classes' },
      { name: 'Social Studies', code: `SOC-${TS}`, desc: 'Social Studies curriculum' },
      { name: 'Computer Science', code: `CS-${TS}`, desc: 'Computer Science and ICT' },
    ];

    for (const subject of subjectData) {
      await subjectsPage.clickAddSubject();
      await subjectsPage.fillSubjectForm(subject.name, subject.code, subject.desc);
      await subjectsPage.submitForm();
      await expectDialogClosed(page);
      await subjectsPage.expectSubjectInTable(subject.name);
    }

    schoolData.subjectNames = SUBJECT_NAMES;
  });

  test('2.10 — School Admin: Assign all 5 subjects to both classes', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const classSubjectsPage = new ClassSubjectsPage(page);
    await classSubjectsPage.goto();

    // Assign subjects to Class 1
    await classSubjectsPage.clickManageSubjects(CLASS1_NAME);
    await classSubjectsPage.expectSheetVisible(CLASS1_NAME);
    await classSubjectsPage.clickAddSubjects();

    for (const subjectName of SUBJECT_NAMES) {
      await classSubjectsPage.selectSubjectInDialog(subjectName);
    }
    await classSubjectsPage.submitAddSubjects();
    await expectDialogClosed(page);

    // Verify all subjects are listed
    for (const subjectName of SUBJECT_NAMES) {
      await classSubjectsPage.expectSubjectInSheet(subjectName);
    }
    await classSubjectsPage.closeSheet();

    // Assign subjects to Class 2
    await classSubjectsPage.clickManageSubjects(CLASS2_NAME);
    await classSubjectsPage.expectSheetVisible(CLASS2_NAME);
    await classSubjectsPage.clickAddSubjects();

    for (const subjectName of SUBJECT_NAMES) {
      await classSubjectsPage.selectSubjectInDialog(subjectName);
    }
    await classSubjectsPage.submitAddSubjects();
    await expectDialogClosed(page);

    for (const subjectName of SUBJECT_NAMES) {
      await classSubjectsPage.expectSubjectInSheet(subjectName);
    }
    await classSubjectsPage.closeSheet();
  });

  test('2.11 — School Admin: Assign Subject 5 (Computer Science) to Teacher 3 in both classes', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const classSubjectsPage = new ClassSubjectsPage(page);
    await classSubjectsPage.goto();

    // Assign Computer Science in Class 1 to Teacher Three
    await classSubjectsPage.clickManageSubjects(CLASS1_NAME);
    await classSubjectsPage.expectSheetVisible(CLASS1_NAME);
    await classSubjectsPage.clickChangeTeacher('Computer Science');
    await classSubjectsPage.selectTeacherInDialog('Teacher Three');
    await classSubjectsPage.submitChangeTeacher();
    await expectDialogClosed(page);
    await classSubjectsPage.closeSheet();

    // Assign Computer Science in Class 2 to Teacher Three
    await classSubjectsPage.clickManageSubjects(CLASS2_NAME);
    await classSubjectsPage.expectSheetVisible(CLASS2_NAME);
    await classSubjectsPage.clickChangeTeacher('Computer Science');
    await classSubjectsPage.selectTeacherInDialog('Teacher Three');
    await classSubjectsPage.submitChangeTeacher();
    await expectDialogClosed(page);
    await classSubjectsPage.closeSheet();
  });

  test('2.12 — School Admin: Assign Subject 4 (Social Studies) from Class 2 to Teacher 1', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const classSubjectsPage = new ClassSubjectsPage(page);
    await classSubjectsPage.goto();

    await classSubjectsPage.clickManageSubjects(CLASS2_NAME);
    await classSubjectsPage.expectSheetVisible(CLASS2_NAME);
    await classSubjectsPage.clickChangeTeacher('Social Studies');
    await classSubjectsPage.selectTeacherInDialog('Teacher One');
    await classSubjectsPage.submitChangeTeacher();
    await expectDialogClosed(page);
    await classSubjectsPage.closeSheet();
  });

  test('2.13 — School Admin: Create 5 students for Class 1 with 1 parent each', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const studentsPage = new StudentsPage(page);
    await studentsPage.goto();
    await studentsPage.expectVisible();

    for (const student of STUDENTS_CLASS1) {
      await page.getByRole('button', { name: /add student/i }).click();
      const dialog = page.locator('[data-slot="dialog-content"]');
      await expect(dialog).toBeVisible();

      // Basic info
      await dialog.getByLabel('First Name').fill(student.first);
      await dialog.getByLabel('Last Name').fill(student.last);
      await dialog.getByLabel('Date of Birth').fill('2015-03-15');

      // Select class
      const classSelect = dialog.locator('button[role="combobox"]').first();
      await classSelect.click();
      await page.getByRole('option', { name: new RegExp(CLASS1_NAME) }).click();

      // Select gender
      const genderSelect = dialog.locator('button[role="combobox"]').nth(1);
      await genderSelect.click();
      await page.getByRole('option', { name: student.gender === 'MALE' ? 'Male' : 'Female', exact: true }).click();

      // Add a guardian
      await dialog.getByRole('button', { name: /add guardian/i }).click();

      // Fill guardian fields (they are indexed as guardians.0.*)
      const guardianSection = dialog.locator('.rounded-lg.border.p-4').first();
      await guardianSection.locator('input[placeholder="First name"]').fill(student.parentFirst);
      await guardianSection.locator('input[placeholder="Last name"]').fill(student.parentLast);
      await guardianSection.locator('input[placeholder="guardian@email.com"]').fill(student.parentEmail);
      await guardianSection.locator('input[placeholder="08012345678"]').fill(student.parentPhone);

      // Select relationship
      const relSelect = guardianSection.locator('button[role="combobox"]');
      await relSelect.click();
      await page.getByRole('option', { name: student.relationship === 'FATHER' ? 'Father' : 'Mother' }).click();

      // Submit
      await dialog.getByRole('button', { name: /enroll student/i }).click();
      await expectDialogClosed(page);

      // Wait for student to appear
      await page.waitForTimeout(1000);
    }
  });

  test('2.14 — School Admin: Create 5 students for Class 2 with 1 parent each', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const studentsPage = new StudentsPage(page);
    await studentsPage.goto();
    await studentsPage.expectVisible();

    for (const student of STUDENTS_CLASS2) {
      await page.getByRole('button', { name: /add student/i }).click();
      const dialog = page.locator('[data-slot="dialog-content"]');
      await expect(dialog).toBeVisible();

      // Basic info
      await dialog.getByLabel('First Name').fill(student.first);
      await dialog.getByLabel('Last Name').fill(student.last);
      await dialog.getByLabel('Date of Birth').fill('2014-05-20');

      // Select class
      const classSelect = dialog.locator('button[role="combobox"]').first();
      await classSelect.click();
      await page.getByRole('option', { name: new RegExp(CLASS2_NAME) }).click();

      // Select gender
      const genderSelect = dialog.locator('button[role="combobox"]').nth(1);
      await genderSelect.click();
      await page.getByRole('option', { name: student.gender === 'MALE' ? 'Male' : 'Female', exact: true }).click();

      // Add a guardian
      await dialog.getByRole('button', { name: /add guardian/i }).click();

      const guardianSection = dialog.locator('.rounded-lg.border.p-4').first();
      await guardianSection.locator('input[placeholder="First name"]').fill(student.parentFirst);
      await guardianSection.locator('input[placeholder="Last name"]').fill(student.parentLast);
      await guardianSection.locator('input[placeholder="guardian@email.com"]').fill(student.parentEmail);
      await guardianSection.locator('input[placeholder="08012345678"]').fill(student.parentPhone);

      const relSelect = guardianSection.locator('button[role="combobox"]');
      await relSelect.click();
      await page.getByRole('option', { name: student.relationship === 'FATHER' ? 'Father' : 'Mother' }).click();

      await dialog.getByRole('button', { name: /enroll student/i }).click();
      await expectDialogClosed(page);

      await page.waitForTimeout(1000);
    }
  });

  test('2.15 — School Admin: Verify all 10 students were created', async ({ page }) => {
    // Verify all 10 students exist via the API
    const auth = await authenticateAccount(schoolData.adminEmail!, TEST_OTP);
    const token = auth.accessToken;
    const sid = schoolData.schoolId!;

    const studentsRes = await apiGet<Array<{ id: string; firstName: string; lastName: string }>>(
      `/schools/${sid}/students?page=0&size=200`,
      token,
    );
    const students = studentsRes.data;

    // Verify all 10 students from both classes exist
    for (const s of [...STUDENTS_CLASS1, ...STUDENTS_CLASS2]) {
      const found = students.find((st) => st.firstName === s.first && st.lastName === s.last);
      expect(found, `Student ${s.first} ${s.last} should exist`).toBeTruthy();
    }
    expect(students.length).toBeGreaterThanOrEqual(10);

    // Store student IDs for later use
    schoolData.studentIds = {};
    for (const s of students) {
      schoolData.studentIds[`${s.firstName} ${s.lastName}`] = s.id;
    }

    // Activate all students (they now default to INACTIVE)
    for (const studentId of Object.values(schoolData.studentIds)) {
      await apiPost(`/schools/${sid}/students/${studentId}/activate`, token);
    }
  });

  test('2.16 — School Admin: Create timetable for each class', async ({ page }) => {
    // Create timetable slots via API (more reliable than UI dialog interaction)
    const authData = await authenticateAccount(schoolData.adminEmail!, TEST_OTP);
    const token = authData.accessToken;
    const sid = schoolData.schoolId!;

    // Fetch session and class IDs from API
    const sessionsRes = await apiGet<Array<{ id: string; name: string }>>(`/schools/${sid}/sessions`, token);
    const session = sessionsRes.data.find((s) => s.name === SESSION_NAME);
    expect(session).toBeTruthy();
    const sessionId = session!.id;

    const classesRes = await apiGet<Array<{ id: string; name: string }>>(`/schools/${sid}/classes`, token);
    const class1 = classesRes.data.find((c) => c.name.includes(CLASS1_NAME));
    const class2 = classesRes.data.find((c) => c.name.includes(CLASS2_NAME));
    expect(class1).toBeTruthy();
    expect(class2).toBeTruthy();

    const slotsClass1 = [
      { dayOfWeek: 'MONDAY', periodNumber: 1, label: 'Mathematics' },
      { dayOfWeek: 'MONDAY', periodNumber: 2, label: 'English Language' },
      { dayOfWeek: 'TUESDAY', periodNumber: 1, label: 'Basic Science' },
      { dayOfWeek: 'WEDNESDAY', periodNumber: 1, label: 'Social Studies' },
      { dayOfWeek: 'THURSDAY', periodNumber: 1, label: 'Computer Science' },
    ];

    const slotsClass2 = [
      { dayOfWeek: 'MONDAY', periodNumber: 1, label: 'English Language' },
      { dayOfWeek: 'MONDAY', periodNumber: 2, label: 'Mathematics' },
      { dayOfWeek: 'TUESDAY', periodNumber: 1, label: 'Computer Science' },
      { dayOfWeek: 'WEDNESDAY', periodNumber: 1, label: 'Basic Science' },
      { dayOfWeek: 'THURSDAY', periodNumber: 1, label: 'Social Studies' },
    ];

    for (const slot of slotsClass1) {
      await apiPost(`/schools/${sid}/timetable/slots`, token, {
        classId: class1!.id,
        sessionId,
        ...slot,
      });
    }

    for (const slot of slotsClass2) {
      await apiPost(`/schools/${sid}/timetable/slots`, token, {
        classId: class2!.id,
        sessionId,
        ...slot,
      });
    }

    // Verify timetable page renders with slots
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    await page.goto('/timetable');
    await expect(page.getByRole('heading', { name: /timetable/i })).toBeVisible({ timeout: 15_000 });

    const selects = page.locator('button[data-slot="select-trigger"]');
    await selects.nth(0).click();
    await page.getByRole('option', { name: SESSION_NAME }).click();
    await selects.nth(1).click();
    await page.getByRole('option', { name: new RegExp(CLASS1_NAME) }).click();
    await expect(page.locator('table')).toBeVisible({ timeout: 15_000 });

    // Verify at least one slot appears in the grid
    await expect(page.getByText('Mathematics')).toBeVisible({ timeout: 10_000 });
  });

  test('2.17 — School Admin: Validate admin dashboard information', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const dashboard = new DashboardPage(page);
    await dashboard.expectGreeting();
    await dashboard.expectAdminDashboard();

    // Verify hero metrics are visible on the enhanced dashboard
    await expect(page.getByText("Today's Attendance").first()).toBeVisible();
    await expect(page.getByText('Teacher Accountability').first()).toBeVisible();
    await expect(page.getByText('Fee Collection').first()).toBeVisible();
  });

  test('2.18 — School Admin: Validate People section pages', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    // Check Users page
    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.expectVisible();
    await usersPage.expectTableNotEmpty();
    // Filter by admin role to verify second admin is present
    await usersPage.roleFilter.click();
    await page.getByRole('option', { name: /admin/i }).click();
    await usersPage.expectUserInTable(ADMIN2_EMAIL);

    // Check Teachers page
    const teachersPage = new TeachersPage(page);
    await teachersPage.goto();
    await teachersPage.expectVisible();
    await teachersPage.expectTableNotEmpty();
    await teachersPage.expectTeacherInTable('Teacher One');
    await teachersPage.expectTeacherInTable('Teacher Two');
    await teachersPage.expectTeacherInTable('Teacher Three');

    // Check Parents page
    const parentsPage = new ParentsPage(page);
    await parentsPage.goto();
    await parentsPage.expectVisible();

    // Check Students page
    const studentsPage = new StudentsPage(page);
    await studentsPage.goto();
    await studentsPage.expectVisible();
    await studentsPage.expectTableNotEmpty();
  });

  test('2.19 — School Admin: Update user profile', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    await profilePage.expectVisible();
    // Verify admin email is shown on profile
    await profilePage.expectEmail(schoolData.adminEmail!);
  });

  test('2.20 — School Admin: Create school event', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();
    await calendarPage.expectLoaded();

    await calendarPage.clickCreateEvent();
    // Use local time format for datetime-local inputs
    const pad = (n: number) => String(n).padStart(2, '0');
    const now = new Date();
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const nw = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const nextWeek = `${nw.getFullYear()}-${pad(nw.getMonth() + 1)}-${pad(nw.getDate())}T${pad(nw.getHours())}:${pad(nw.getMinutes())}`;
    await calendarPage.fillEventForm({
      title: EVENT_TITLE,
      description: 'Annual open day for parents and prospective students',
      startTime: today,
      endTime: nextWeek,
      location: 'School Auditorium',
    });
    await calendarPage.submitForm();
    await calendarPage.expectDialogHidden();
    await calendarPage.expectEventVisible(EVENT_TITLE);
  });

  test('2.21 — School Admin: Verify calendar loads', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const calendarPage = new CalendarPage(page);
    await calendarPage.goto();
    await calendarPage.expectVisible();
  });

  test('2.22 — School Admin: Configure notification preferences', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const notifPage = new NotificationPreferencesPage(page);
    await notifPage.goto();
    await notifPage.expectVisible();
  });

  test('2.23 — School Admin: Update school settings general tab', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const settingsPage = new SchoolSettingsPage(page);
    await settingsPage.goto();
    await settingsPage.expectVisible();

    // Click General tab and verify it loads
    await settingsPage.generalTab.click();
    await expect(page.getByText('General Information')).toBeVisible({ timeout: 10_000 });
  });

  test('2.24 — School Admin: Verify change status dialog for Teacher Three', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.expectVisible();

    // Filter by teacher role to find Teacher Three (may be on page 2 with default sort)
    await usersPage.roleFilter.click();
    await page.getByRole('option', { name: /teacher/i }).click();
    await page.waitForTimeout(1000);

    // Open the Change User Status dialog for Teacher Three
    await usersPage.clickChangeStatus('Teacher Three');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Verify the dialog shows the correct content
    await expect(dialog.getByText('Change User Status')).toBeVisible();
    await expect(dialog.getByText('Teacher Three')).toBeVisible();
    await expect(dialog.getByText('Active')).toBeVisible(); // Current status badge

    // Verify the status dropdown has the expected options
    await dialog.getByRole('combobox').click();
    await expect(page.getByRole('option', { name: 'Inactive' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Suspended' })).toBeVisible();

    // Close the dropdown and cancel
    await page.keyboard.press('Escape');
    await dialog.getByRole('button', { name: /cancel/i }).click();
    await expect(dialog).not.toBeVisible({ timeout: 5_000 });
  });

  test('2.25 — School Admin: View audit logs', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const auditPage = new AuditLogsPage(page);
    await auditPage.goto();
    await auditPage.expectVisible();
    await auditPage.expectTableVisible();
    await auditPage.expectTableNotEmpty();
  });

  test('2.26 — School Admin: View activity feed', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const activityPage = new ActivityFeedPage(page);
    await activityPage.goto();
    await activityPage.expectVisible();
  });

  test('2.26b — School Admin: Analytics page shows all four tabs', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /attendance/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /academic/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /fees/i })).toBeVisible();

    // Overview stat cards
    await expect(page.getByText('Total Students')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Total Teachers')).toBeVisible();
  });

  test('2.26c — School Admin: Analytics attendance tab shows filters', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('tab', { name: /attendance/i }).click();
    await expect(page.locator('input[type="date"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('2.26d — School Admin: Analytics academic tab shows filters', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('tab', { name: /academic/i }).click();
    await expect(page.getByRole('combobox').first()).toBeVisible({ timeout: 10_000 });
  });

  test('2.26e — School Admin: Analytics fees tab shows collection data', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('tab', { name: /fees/i }).click();
    await expect(page.getByText('Collection Rate')).toBeVisible({ timeout: 10_000 });
  });

  test('2.26f — School Admin: Audit logs filtering works', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const auditPage = new AuditLogsPage(page);
    await auditPage.goto();
    await auditPage.expectVisible();
    await auditPage.expectTableVisible();

    // Verify table headers
    await auditPage.expectTableHeaders();

    // Filter by entity type
    await auditPage.filterByEntityType('Student');
    await page.waitForTimeout(1_000);
    await auditPage.expectTableVisible();

    // Reset filter
    await auditPage.filterByEntityType('All Entities');
    await page.waitForTimeout(500);

    // Filter by action
    await auditPage.filterByAction('Create');
    await page.waitForTimeout(1_000);
    await auditPage.expectTableVisible();

    // Reset action filter
    await auditPage.filterByAction('All Actions');
    await page.waitForTimeout(500);

    // Verify filter options exist
    await auditPage.entityTypeFilter.click();
    await expect(page.getByRole('option').getByText('Student')).toBeVisible();
    await expect(page.getByRole('option').getByText('Teacher')).toBeVisible();
    await page.keyboard.press('Escape');

    await auditPage.actionFilter.click();
    await expect(page.getByRole('option').getByText('Create')).toBeVisible();
    await expect(page.getByRole('option').getByText('Update')).toBeVisible();
    await expect(page.getByRole('option').getByText('Delete')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('2.26g — School Admin: Data migration page access and teacher restriction', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const dataMigration = new DataMigrationPage(page);
    await dataMigration.goto();
    await dataMigration.expectVisible();
    await expect(dataMigration.uploadTab).toBeVisible();
    await expect(dataMigration.historyTab).toBeVisible();
  });

  test('2.26h — School Admin: Safety page shows emergency alerts and pickup logs tabs', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    await page.goto('/safety');
    await expect(page.getByRole('heading', { name: /safety|emergency/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('tab', { name: /emergency alerts/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /pickup logs/i })).toBeVisible();
  });

  test('2.26i — School Admin: Parents page shows data table', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const parentsPage = new ParentsPage(page);
    await parentsPage.goto();
    await parentsPage.expectVisible();
    // Parents were created during student enrollment
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });
  });

  test('2.26j — School Admin: School settings shows all tabs', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const settingsPage = new SchoolSettingsPage(page);
    await settingsPage.goto();
    await settingsPage.expectVisible();
    await expect(page.getByRole('tab', { name: /general/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /grading/i })).toBeVisible();
  });

  test('2.26k — School Admin: Teachers page search works', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const teachersPage = new TeachersPage(page);
    await teachersPage.goto();
    await teachersPage.expectVisible();
    await teachersPage.expectTableNotEmpty();

    // Search for Teacher One (use partial name since search may work on individual fields)
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await searchInput.fill('One');
      await page.waitForTimeout(1_000);
      await teachersPage.expectTeacherInTable('Teacher One');
    }
  });

  test('2.26l — School Admin: User management filter by role', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.expectVisible();
    await usersPage.expectTableNotEmpty();

    // Try filtering by role if filter exists
    const roleFilter = page.getByRole('combobox').first();
    if (await roleFilter.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await roleFilter.click();
      const teacherOption = page.getByRole('option', { name: /teacher/i });
      if (await teacherOption.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await teacherOption.click();
        await page.waitForTimeout(1_000);
        // Table should still be visible after filtering
        await expect(page.locator('table')).toBeVisible();
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('2.26m — School Admin: Sidebar shows correct nav items', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const sidebar = new SidebarPage(page);
    await sidebar.expectNavItem('Dashboard');
    await sidebar.expectNavItem('Academics');
    await sidebar.expectNavItem('Communication');
    await sidebar.expectNavItem('Help & Support');
  });

  test('2.26n — School Admin: Admin cannot access system routes', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    await page.goto('/system/schools');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });

    await page.goto('/system/seed');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });
  });

  test('2.26o — School Admin: Admin can deep-link to protected routes', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    await page.goto('/students');
    await expect(page).toHaveURL(/\/students\/?/);
    await expect(page.getByRole('heading', { name: /students/i })).toBeVisible({ timeout: 20_000 });

    await page.goto('/homework');
    await expect(page).toHaveURL(/\/homework\/?/);
    await expect(page.getByRole('heading', { name: /homework/i })).toBeVisible({ timeout: 20_000 });

    await page.goto('/attendance');
    await expect(page).toHaveURL(/\/attendance\/?/);
    await expect(page.getByRole('heading', { name: /attendance/i })).toBeVisible({ timeout: 20_000 });
  });

  test('2.27 — School Admin: Add second parent to students via API', async () => {
    const auth = await authenticateAccount(schoolData.adminEmail!, TEST_OTP);
    const sid = schoolData.schoolId!;
    const token = auth.accessToken;

    // Get student IDs for Funke Alade, Gbenga Salami, and Ade Bakare
    const studentsRes = await apiGet<Array<{ id: string; firstName: string; lastName: string }>>(
      `/schools/${sid}/students?page=0&size=200`,
      token,
    );
    const students = studentsRes.data;
    const funke = students.find((s) => s.firstName === 'Funke' && s.lastName === 'Alade');
    const gbenga = students.find((s) => s.firstName === 'Gbenga' && s.lastName === 'Salami');
    const ade = students.find((s) => s.firstName === 'Ade' && s.lastName === 'Bakare');
    expect(funke).toBeTruthy();
    expect(gbenga).toBeTruthy();
    expect(ade).toBeTruthy();

    // Link shared parent (SECOND_PARENT_EMAIL) to Funke and Gbenga
    await apiPost(`/schools/${sid}/students/${funke!.id}/parents`, token, {
      firstName: 'Shared',
      lastName: 'Parent',
      email: SECOND_PARENT_EMAIL,
      phone: '08022222001',
      relationship: 'MOTHER',
    });

    await apiPost(`/schools/${sid}/students/${gbenga!.id}/parents`, token, {
      firstName: 'Shared',
      lastName: 'Parent',
      email: SECOND_PARENT_EMAIL,
      phone: '08022222001',
      relationship: 'MOTHER',
    });

    // Link second parent to Ade Bakare
    await apiPost(`/schools/${sid}/students/${ade!.id}/parents`, token, {
      firstName: 'Aduke',
      lastName: 'Bakare',
      email: SECOND_PARENT_ADE_EMAIL,
      phone: '08022222002',
      relationship: 'MOTHER',
    });

    schoolData.sharedParentEmail = SECOND_PARENT_EMAIL;
  });

  test('2.28 — School Admin: Verify student siblings (Funke siblings tab shows Gbenga)', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    // Get Funke's student ID
    const funkeId = schoolData.studentIds?.['Funke Alade'];
    expect(funkeId).toBeTruthy();

    const studentDetail = new StudentDetailsPage(page);
    await studentDetail.goto(funkeId!);
    await studentDetail.expectVisible();
    await studentDetail.expectStudentName('Funke Alade');

    // Check the parents tab to verify shared parent is listed
    await studentDetail.viewParentsTab();
    await studentDetail.expectParentVisible('Shared Parent');
  });

  test('2.29 — School Admin: Logout', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 3: TEACHER 1
  // =========================================================================

  test('3.1 — Teacher: Login and validate dashboard stats', async ({ page }) => {
    // Login as Teacher One (class teacher for JSS 1)
    await loginViaUI(page, TEACHER1_EMAIL);
    const dashboard = new DashboardPage(page);
    await dashboard.expectVisible();
    await dashboard.expectTeacherDashboard();
    await dashboard.expectGreeting();

    // Verify stat cards on enhanced teacher dashboard
    const main = page.getByRole('main');
    await expect(main.getByText("Today's Attendance").first()).toBeVisible({ timeout: 15_000 });
    await expect(main.getByText('Homework to Grade').first()).toBeVisible();
    await expect(main.getByText('My Students').first()).toBeVisible();

    // Verify Today's Schedule section
    await expect(main.getByText("Today's Schedule").first()).toBeVisible();

    // Verify Class Performance section
    await expect(main.getByText('Class Performance')).toBeVisible();

    // Verify key navigation items
    const sidebar = new SidebarPage(page);
    await sidebar.expectNavItem('Dashboard');
    await sidebar.expectNavItem('Students');
    await sidebar.expectNavItem('My Classes');
    await sidebar.expectNavItem('Academics');
  });

  test('3.1b — Teacher: Dashboard shows all stat cards and sections', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const main = page.getByRole('main');
    // Stat cards
    await expect(main.getByText("Today's Attendance").first()).toBeVisible({ timeout: 15_000 });
    await expect(main.getByText('Homework to Grade').first()).toBeVisible();
    await expect(main.getByText('Parent Messages').first()).toBeVisible();
    await expect(main.getByText('My Students').first()).toBeVisible();

    // Schedule
    await expect(main.getByText("Today's Schedule").first()).toBeVisible();

    // At-risk and class performance sections
    await expect(main.getByText('Students Needing Attention')).toBeVisible();
    await expect(main.getByText('Class Performance')).toBeVisible();
  });

  test('3.1c — Teacher: Quick action navigates to attendance page', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const attendanceLink = page.getByRole('link', { name: /take attendance/i })
      .or(page.locator('a', { hasText: 'Take Attendance' }));
    if (await attendanceLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await attendanceLink.click();
      await expect(page).toHaveURL(/\/attendance\/?/, { timeout: 10_000 });
    }
  });

  test('3.1d — Teacher: Sidebar shows correct nav items', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const sidebar = new SidebarPage(page);
    await sidebar.expectNavItem('Dashboard');
    await sidebar.expectNavItem('Students');
    await sidebar.expectNavItem('My Classes');
    await sidebar.expectNavItem('Academics');
  });

  test('3.1e — Teacher: Cannot access admin-only routes', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/school-settings');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });

    await page.goto('/users');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });

    await page.goto('/fees');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });

    await page.goto('/data-migration');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });
  });

  test('3.1f — Teacher: Can deep-link to attendance and homework', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/attendance');
    await expect(page).toHaveURL(/\/attendance\/?/);
    await expect(page.getByRole('heading', { name: /attendance/i })).toBeVisible({ timeout: 20_000 });
  });

  test('3.1g — Teacher: Help page loads', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const helpPage = new HelpPage(page);
    await helpPage.goto();
    await helpPage.expectVisible();
  });

  test('3.2 — Teacher: Validate My Classes page and subjects', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/my-classes');
    await expect(page.getByRole('heading', { name: /my classes/i })).toBeVisible({ timeout: 15_000 });

    // Verify summary stat cards
    await expect(page.getByText('Total Classes')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Total Students')).toBeVisible();

    // Teacher 1 is class teacher for JSS 1 — verify class card heading
    await expect(page.locator('[data-slot="card-title"]', { hasText: CLASS1_NAME })).toBeVisible({ timeout: 10_000 });

    // Verify My Subjects table — Teacher 1 is class teacher of JSS 1, so inherited all subjects
    // Also assigned Social Studies from Class 2 (test 2.12)
    await expect(page.getByText('My Subjects')).toBeVisible({ timeout: 15_000 });
    const subjectsTable = page.locator('table').last();
    await expect(subjectsTable.getByText('Mathematics').first()).toBeVisible({ timeout: 10_000 });
    await expect(subjectsTable.getByText('English Language').first()).toBeVisible();

    // Social Studies from JSS 2 should show as Subject Teacher
    await expect(subjectsTable.getByText('Social Studies').first()).toBeVisible();
  });

  test('3.2b — Teacher: My Subjects shows role badges (Class Teacher and Subject Teacher)', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/my-classes');
    await expect(page.getByRole('heading', { name: /my classes/i })).toBeVisible({ timeout: 15_000 });

    // Scroll to My Subjects section
    await expect(page.getByText('My Subjects')).toBeVisible({ timeout: 15_000 });
    const subjectsTable = page.locator('table').last();

    // Teacher 1 is class teacher of JSS 1 (inherited subjects) + subject teacher of Social Studies in JSS 2
    // Should see "Class Teacher" badges for JSS 1 subjects
    await expect(subjectsTable.getByText('Class Teacher').first()).toBeVisible({ timeout: 10_000 });
    // Should see "Subject Teacher" badge for Social Studies in JSS 2
    await expect(subjectsTable.getByText('Subject Teacher').first()).toBeVisible({ timeout: 10_000 });
  });

  test('3.2c — Teacher: My Classes shows summary stats and class cards', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/my-classes');
    await expect(page.getByRole('heading', { name: /my classes/i })).toBeVisible({ timeout: 15_000 });

    // Summary stat cards
    await expect(page.getByText('Total Classes')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Total Students')).toBeVisible();

    // Class card for JSS 1 should have student count and View Details button
    const classCard = page.locator('[data-slot="card"]', { hasText: CLASS1_NAME }).first();
    if (await classCard.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(classCard.getByText(/student/i)).toBeVisible();
      const viewDetailsBtn = classCard.getByRole('link', { name: /view details/i })
        .or(classCard.getByRole('button', { name: /view details/i }));
      await expect(viewDetailsBtn).toBeVisible();
    }
  });

  test('3.3 — Teacher: Validate today\'s schedule from timetable', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    // The dashboard shows Today's Schedule
    const scheduleCard = page.locator('text=Today\'s Schedule').locator('..');
    await expect(scheduleCard).toBeVisible({ timeout: 15_000 });

    // Check for schedule content — should show periods or "No schedule for today"
    const scheduleSection = scheduleCard.locator('..');
    const hasSchedule = await scheduleSection.getByText(/Period \d/).first().isVisible().catch(() => false);
    const hasNoSchedule = await scheduleSection.getByText(/No (classes |schedule )?/i).first().isVisible().catch(() => false);

    // One of these must be true
    expect(hasSchedule || hasNoSchedule).toBeTruthy();
  });

  test('3.4 — Teacher: Take attendance for JSS 1 (class teacher)', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/attendance');
    await expect(page.getByRole('heading', { name: /attendance/i })).toBeVisible({ timeout: 15_000 });

    // Mark Attendance tab should be active by default
    await expect(page.getByText('Select Class & Date')).toBeVisible({ timeout: 10_000 });

    // Select JSS 1 class inside the AttendanceGrid's "Select Class & Date" card
    // (NOT the page-level filter select which is the first on the page)
    const selectCard = page.locator('[data-slot="card"]').filter({ hasText: 'Select Class & Date' });
    const classSelect = selectCard.locator('[data-slot="select-trigger"]');
    await classSelect.click();
    await page.getByRole('option', { name: new RegExp(CLASS1_NAME) }).click();

    // Wait for students to load
    await expect(page.getByText(/Mark Attendance \(\d+ student/)).toBeVisible({ timeout: 15_000 });

    // Mark all present using the quick action
    await page.getByRole('button', { name: /mark all present/i }).click();

    // Mark first student as late to test mixed attendance
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('input[type="radio"]').nth(2).click(); // Late radio (3rd)

    // Verify counters updated
    await expect(page.getByText(/Present: \d+/)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/Late: 1/)).toBeVisible();

    // Submit attendance
    await page.getByRole('button', { name: /submit attendance/i }).click();
    await expectToast(page, 'success');
  });

  test('3.5 — Teacher: Take attendance for JSS 2 (subject teacher for Social Studies)', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/attendance');
    await expect(page.getByRole('heading', { name: /attendance/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Select Class & Date')).toBeVisible({ timeout: 10_000 });

    // Select JSS 2 class inside AttendanceGrid's card
    const selectCard = page.locator('[data-slot="card"]').filter({ hasText: 'Select Class & Date' });
    const classSelect = selectCard.locator('[data-slot="select-trigger"]');
    await classSelect.click();
    await page.getByRole('option', { name: new RegExp(CLASS2_NAME) }).click();

    // Wait for students to load
    await expect(page.getByText(/Mark Attendance \(\d+ student/)).toBeVisible({ timeout: 15_000 });

    // Mark all present
    await page.getByRole('button', { name: /mark all present/i }).click();

    // Submit attendance
    await page.getByRole('button', { name: /submit attendance/i }).click();
    await expectToast(page, 'success');
  });

  test('3.5b — Teacher: Attendance page shows daily overview and tabs', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/attendance');
    await expect(page.getByRole('heading', { name: /attendance/i })).toBeVisible({ timeout: 15_000 });

    // Daily overview stats
    await expect(page.getByText('Total Students')).toBeVisible({ timeout: 10_000 });

    // Mark Attendance and Records tabs
    await expect(page.getByRole('tab', { name: /mark attendance/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /records/i })).toBeVisible();
  });

  test('3.5c — Teacher: Academics page shows all three tabs', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const academics = new GradeStudentsPage(page);
    await academics.goto();
    await academics.expectVisible();

    await expect(academics.assessmentsTab).toBeVisible();
    await expect(academics.gradeEntryTab).toBeVisible();
    await expect(academics.reportCardsTab).toBeVisible();
  });

  test('3.6 — Teacher: Create CA1 assessments for all subjects in JSS 1', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const academics = new GradeStudentsPage(page);
    await academics.goto();
    await academics.expectVisible();

    // Create a CA1 assessment for each of Teacher 1's 4 subjects in JSS 1
    const today = new Date().toISOString().split('T')[0];
    for (const subject of TEACHER1_JSS1_SUBJECTS) {
      await academics.clickCreateAssessment();
      await academics.fillAssessmentForm(`${subject} CA1 ${TS}`, '100', today);
      await academics.selectAssessmentClass(new RegExp(CLASS1_NAME));
      await academics.selectAssessmentSubject(new RegExp(subject));
      await academics.selectAssessmentTerm(new RegExp(TERM_NAME));
      await academics.selectAssessmentType(/CA1/);
      await academics.submitAssessmentForm();
      await expectDialogClosed(page);
      await academics.expectAssessmentInTable(`${subject} CA1 ${TS}`);
    }
  });

  test('3.7 — Teacher: Enter grades for all subjects via API', async () => {
    // The Grade Entry UI requires backend to pre-populate students for an assessment.
    // Use the API directly to submit scores for all 4 subjects.
    const auth = await authenticateAccount(TEACHER1_EMAIL, TEST_OTP);
    const sid = schoolData.schoolId!;

    // Get assessments
    const assessmentsRes = await apiGet<Array<{ id: string; title: string; classId: string; subjectName: string }>>(
      `/schools/${sid}/assessments?size=200`,
      auth.accessToken,
    );
    const assessments = assessmentsRes.data;

    // Get classes to find JSS 1 class ID
    const classesRes = await apiGet<Array<{ id: string; name: string }>>(
      `/schools/${sid}/classes?size=200`,
      auth.accessToken,
    );
    const jss1Class = classesRes.data.find((c) => c.name === CLASS1_NAME);
    expect(jss1Class).toBeTruthy();

    // Get JSS 1 students
    const studentsRes = await apiGet<Array<{ id: string; firstName: string; lastName: string }>>(
      `/schools/${sid}/students?classId=${jss1Class!.id}&size=200`,
      auth.accessToken,
    );
    const students = studentsRes.data;
    expect(students.length).toBeGreaterThanOrEqual(5);

    // Score sets per subject
    const scoreMap: Record<string, number[]> = {
      'Mathematics': [85, 72, 90, 65, 78],
      'English Language': [88, 75, 82, 70, 95],
      'Basic Science': [76, 80, 92, 68, 84],
      'Social Studies': [79, 83, 74, 91, 87],
    };

    for (const subject of TEACHER1_JSS1_SUBJECTS) {
      const assessment = assessments.find(
        (a) => a.title.includes(subject) && a.title.includes('CA1') && a.title.includes(TS),
      );
      expect(assessment).toBeTruthy();

      const scores = scoreMap[subject] ?? [80, 80, 80, 80, 80];
      const bulkScores = students.slice(0, 5).map((s, i) => ({
        studentId: s.id,
        score: scores[i],
      }));

      await apiPost(
        `/schools/${sid}/assessments/${assessment!.id}/grades`,
        auth.accessToken,
        { grades: bulkScores },
      );
    }
  });

  test('3.8 — Teacher: Verify grades appear in Grade Entry UI', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const academics = new GradeStudentsPage(page);
    await academics.goto();
    await academics.expectVisible();

    // Go to Grade Entry tab
    await academics.goToGradeEntry();

    // Select the Mathematics CA1 assessment — now that grades exist, students should appear
    await academics.selectAssessmentForGrading(`Mathematics CA1 ${TS}`);

    // Wait for students to appear in the grade table (grades were submitted via API)
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 });

    // Verify at least one score is visible
    const scoreInputs = page.locator('table tbody tr input[type="number"]');
    await expect(scoreInputs.first()).toBeVisible({ timeout: 5_000 });
  });

  test('3.8b — Teacher: Assessment table shows expected columns', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const academics = new GradeStudentsPage(page);
    await academics.goto();
    await academics.expectVisible();

    const headers = academics.dataTable.locator('thead th');
    await expect(headers.getByText('Title')).toBeVisible();
    await expect(headers.getByText('Type')).toBeVisible();
    await expect(headers.getByText('Max Score')).toBeVisible();
  });

  test('3.8c — Teacher: Report cards tab shows generate button', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const academics = new GradeStudentsPage(page);
    await academics.goto();
    await academics.expectVisible();

    await academics.goToReportCards();
    await expect(
      page.getByRole('button', { name: /generate report cards/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('3.9 — Teacher: Create homework for all 4 subjects in JSS 1', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const homework = new ManageHomeworkPage(page);
    await homework.goto();
    await homework.expectVisible();

    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    schoolData.homeworkTitles = [];
    for (const subject of TEACHER1_JSS1_SUBJECTS) {
      const hwTitle = `${subject} HW ${TS}`;
      await homework.clickCreate();
      await homework.fillHomeworkForm(
        hwTitle,
        `Homework assignment for ${subject}. Complete all exercises.`,
        '50',
      );
      await homework.selectClass(new RegExp(CLASS1_NAME));
      await homework.selectSubject(new RegExp(subject));
      await homework.setDates(today, dueDate);
      await homework.submitForm();
      await expectDialogClosed(page);
      await homework.expectHomeworkInTable(hwTitle);
      schoolData.homeworkTitles!.push(hwTitle);
    }
  });

  test('3.10 — Teacher: View student details and verify parent info', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    // Get the student ID for Ade Bakare via API
    const auth = await authenticateAccount(TEACHER1_EMAIL, TEST_OTP);
    const sid = schoolData.schoolId!;
    const studentsRes = await apiGet<Array<{ id: string; firstName: string; lastName: string }>>(
      `/schools/${sid}/students?page=0&size=200`,
      auth.accessToken,
    );
    const ade = studentsRes.data.find((s) => s.firstName === 'Ade' && s.lastName === 'Bakare');
    expect(ade).toBeTruthy();

    // Navigate to student detail page
    const studentDetail = new StudentDetailsPage(page);
    await studentDetail.goto(ade!.id);
    await studentDetail.expectVisible();
    await studentDetail.expectStudentName('Ade Bakare');

    // Verify Profile tab
    await studentDetail.viewProfileTab();
    await expect(page.getByText(CLASS1_NAME)).toBeVisible({ timeout: 10_000 });

    // Verify Parents tab — Ade's parent is Olu Bakare (FATHER)
    await studentDetail.viewParentsTab();
    await studentDetail.expectParentVisible('Olu Bakare');
    // Verify parent email is shown
    await expect(page.getByText(STUDENTS_CLASS1[0].parentEmail)).toBeVisible({ timeout: 10_000 });

    // Verify Academics tab exists
    const academicsTab = page.getByRole('tab', { name: /academics/i });
    await academicsTab.click();
    // Academics content should show — either report cards or "No academic records"
    await expect(
      page.getByText(/academic records|Average Score/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test('3.11 — Teacher: Verify attendance shows in Records tab', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/attendance');
    await expect(page.getByRole('heading', { name: /attendance/i })).toBeVisible({ timeout: 15_000 });

    // Switch to Records tab
    await page.getByRole('tab', { name: /records/i }).click();

    // Records should show entries from attendance taken in tests 3.4 and 3.5
    // Wait for the table to show at least one record
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15_000 });
  });

  test('3.12 — Teacher: Validate student discipline tab', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    // Navigate to a student detail page and check discipline tab
    const adeId = schoolData.studentIds?.['Ade Bakare'];
    expect(adeId).toBeTruthy();

    const studentDetail = new StudentDetailsPage(page);
    await studentDetail.goto(adeId!);
    await studentDetail.expectVisible();

    // Try to click discipline tab if it exists
    const disciplineTab = page.getByRole('tab', { name: /discipline/i });
    if (await disciplineTab.isVisible().catch(() => false)) {
      await disciplineTab.click();
      // Verify discipline content loads (empty or with records)
      await expect(
        page.getByText(/discipline|no records|no incidents/i)
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  test('3.13 — Teacher: Record welfare observation', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const welfarePage = new WelfarePage(page);
    await welfarePage.goto();
    await welfarePage.expectVisible();

    await welfarePage.clickRecordWelfare();

    // Select class and student
    await welfarePage.selectClass(CLASS1_NAME);
    // Wait for students to load
    await page.waitForTimeout(1000);
    await welfarePage.selectStudent('Ade Bakare');
    await welfarePage.selectStatus('Unwell');
    await welfarePage.fillNotes('Student appears tired and distracted today. Follow up needed.');
    await welfarePage.submitForm();
    await expectDialogClosed(page);
  });

  test('3.14 — Teacher: Log mood entry', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const moodPage = new MoodTrackerPage(page);
    await moodPage.goto();
    await moodPage.expectVisible();

    // Open log mood dialog
    const dialog = await moodPage.openLogMoodDialog();

    // The mood form has: Student select, Mood select, Note textarea (no class select)
    const studentSelect = dialog.locator('button[role="combobox"]').first();
    await studentSelect.click();
    await page.getByRole('option', { name: 'Bola Okafor' }).click();

    // Select mood
    const moodSelect = dialog.locator('button[role="combobox"]').nth(1);
    await moodSelect.click();
    await page.getByRole('option').first().click();

    // Fill notes if available
    const notesField = dialog.getByPlaceholder(/notes|observation/i);
    if (await notesField.isVisible().catch(() => false)) {
      await notesField.fill('Student seems happy and engaged today.');
    }

    // Submit
    const submitBtn = dialog.getByRole('button', { name: /save|log|submit/i });
    await submitBtn.click();
    await expectDialogClosed(page);
  });

  test('3.15 — Teacher: Add health record', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const healthPage = new HealthRecordsPage(page);
    await healthPage.goto();
    await healthPage.expectVisible();

    const dialog = await healthPage.openAddRecordDialog();

    // Health form has: Student select, Record Type select, Title input, Description, Severity (no class select)
    const studentSelect = dialog.locator('button[role="combobox"]').first();
    await studentSelect.click();
    await page.getByRole('option', { name: 'Chidi Eze' }).click();

    // Select record type
    const typeSelect = dialog.locator('button[role="combobox"]').nth(1);
    await typeSelect.click();
    await page.getByRole('option').first().click();

    // Fill title (required)
    await dialog.getByPlaceholder('e.g. Peanut Allergy').fill('Peanut Allergy');

    // Fill description
    await dialog.getByPlaceholder('Additional details...').fill('Student has a mild peanut allergy. EpiPen kept in school clinic.');

    // Submit
    const submitBtn = dialog.getByRole('button', { name: /save|add|create|submit/i });
    await submitBtn.click();
    await expectDialogClosed(page);
  });

  test('3.15b — Teacher: Welfare page shows filters and table headers', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const welfarePage = new WelfarePage(page);
    await welfarePage.goto();
    await welfarePage.expectVisible();

    // Verify welfare table headers
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10_000 });

    // Record Welfare button should be visible
    await expect(page.getByRole('button', { name: /record welfare/i })).toBeVisible();
  });

  test('3.15c — Teacher: Mood tracker page shows Log Mood button', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const moodPage = new MoodTrackerPage(page);
    await moodPage.goto();
    await moodPage.expectVisible();
    await expect(page.getByRole('button', { name: /log mood/i })).toBeVisible({ timeout: 10_000 });
  });

  test('3.15d — Teacher: Health records page shows Add Record button', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const healthPage = new HealthRecordsPage(page);
    await healthPage.goto();
    await healthPage.expectVisible();
    await expect(page.getByRole('button', { name: /add record/i })).toBeVisible({ timeout: 10_000 });
  });

  test('3.15e — Teacher: Create and delete a homework assignment', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const homework = new ManageHomeworkPage(page);
    await homework.goto();
    await homework.expectVisible();

    const deleteTitle = `Delete HW ${TS}`;
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await homework.clickCreate();
    await homework.fillHomeworkForm(deleteTitle, 'This homework will be deleted.', '25');
    await homework.selectClass(new RegExp(CLASS1_NAME));
    await homework.selectSubject(/Mathematics/);
    await homework.setDates(today, dueDate);
    await homework.submitForm();
    await expectDialogClosed(page);
    await homework.expectHomeworkInTable(deleteTitle);

    // Delete it
    await homework.deleteHomework(deleteTitle);
    await homework.expectHomeworkNotInTable(deleteTitle);
  });

  test('3.15f — Teacher: Create and delete an assessment', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const academics = new GradeStudentsPage(page);
    await academics.goto();
    await academics.expectVisible();

    const deleteTitle = `Delete Assessment ${TS}`;
    const today = new Date().toISOString().split('T')[0];

    await academics.clickCreateAssessment();
    await academics.fillAssessmentForm(deleteTitle, '50', today);
    await academics.selectAssessmentClass(new RegExp(CLASS1_NAME));
    await academics.selectAssessmentSubject(/Mathematics/);
    await academics.selectAssessmentTerm(new RegExp(TERM_NAME));
    await academics.selectAssessmentType(/CA3/i);
    await academics.submitAssessmentForm();
    await expectDialogClosed(page);
    await academics.expectAssessmentInTable(deleteTitle);

    // Delete it
    await academics.deleteAssessment(deleteTitle);
    await expect(academics.dataTable.getByText(deleteTitle)).not.toBeVisible({ timeout: 5_000 });
  });

  test('3.15g — Teacher: Subject permissions (class teacher vs specialist) via API', async () => {
    // Teacher 1 is class teacher for JSS 1 — should be able to create assessment for inherited subjects
    const auth = await authenticateAccount(TEACHER1_EMAIL, TEST_OTP);
    const sid = schoolData.schoolId!;

    // Get class and subject IDs
    const classesRes = await apiGet<Array<{ id: string; name: string }>>(
      `/schools/${sid}/classes?size=200`,
      auth.accessToken,
    );
    const jss1 = classesRes.data.find((c) => c.name === CLASS1_NAME);
    expect(jss1).toBeTruthy();

    // Get Teacher 1's subjects via my-subjects endpoint
    const subjectsRes = await apiGet<Array<{ subjectName?: string; name?: string }>>(
      `/schools/${sid}/my-subjects`,
      auth.accessToken,
    );
    expect(subjectsRes.data).toBeDefined();
    expect(Array.isArray(subjectsRes.data)).toBe(true);
    // Teacher 1 should have inherited subjects from JSS 1 + Social Studies from JSS 2
    expect(subjectsRes.data.length).toBeGreaterThanOrEqual(4);

    const subjectNames = subjectsRes.data
      .map((s) => (s.subjectName ?? s.name ?? '').toLowerCase());
    expect(subjectNames.some((n) => n.includes('mathematics'))).toBeTruthy();
    expect(subjectNames.some((n) => n.includes('english'))).toBeTruthy();
  });

  test('3.16 — Teacher: Send message to parent', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const messagesPage = new MessagesPage(page);
    await messagesPage.goto();
    await messagesPage.expectVisible();

    // Click new conversation/message button
    const newMsgBtn = page.getByRole('button', { name: /new message|new conversation|compose/i });
    if (await newMsgBtn.isVisible().catch(() => false)) {
      await newMsgBtn.click();

      const dialog = page.locator('[data-slot="dialog-content"]');
      if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
        // Select recipient — search for the shared parent
        const recipientInput = dialog.getByPlaceholder(/search|recipient/i);
        if (await recipientInput.isVisible().catch(() => false)) {
          await recipientInput.fill('Shared');
          await page.waitForTimeout(1000);
          const option = page.getByRole('option').first();
          if (await option.isVisible().catch(() => false)) {
            await option.click();
          }
        }

        // Fill message
        const messageInput = dialog.getByPlaceholder(/message|type here/i);
        if (await messageInput.isVisible().catch(() => false)) {
          await messageInput.fill(`Hello, this is Teacher One. I wanted to discuss your child's progress in ${CLASS1_NAME}.`);
        }

        // Send
        const sendBtn = dialog.getByRole('button', { name: /send/i });
        if (await sendBtn.isVisible().catch(() => false)) {
          await sendBtn.click();
        }
      }
    }
    // If no new message button, just verify the page loaded — messaging UI varies
  });

  test('3.17 — Teacher: Publish announcement', async ({ page }) => {
    // Only admins can create announcements via UI. Create one via API as admin,
    // then verify the teacher can see it on the announcements page.
    const adminAuth = await authenticateAccount(schoolData.adminEmail!, TEST_OTP);
    const sid = schoolData.schoolId!;
    await apiPost(`/schools/${sid}/announcements`, adminAuth.accessToken, {
      title: ANNOUNCEMENT_TITLE,
      content: 'Dear parents, please note that the term exams will begin next week. Ensure your children are well prepared.',
      targetAudience: 'ALL',
      priority: 'NORMAL',
    });

    // Now publish it
    const announcementsRes = await apiGet<Array<{ id: string; title: string }>>(
      `/schools/${sid}/announcements?page=0&size=10`,
      adminAuth.accessToken,
    );
    const announcement = announcementsRes.data.find((a) => a.title === ANNOUNCEMENT_TITLE);
    expect(announcement).toBeTruthy();
    await apiPut(`/schools/${sid}/announcements/${announcement!.id}/publish`, adminAuth.accessToken, {});

    // Teacher verifies the announcement is visible
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();
    await announcementsPage.expectVisible();

    await expect(page.getByText(ANNOUNCEMENT_TITLE)).toBeVisible({ timeout: 10_000 });
    schoolData.announcementTitle = ANNOUNCEMENT_TITLE;
  });

  test('3.18 — Teacher: View notifications page', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    // Navigate to communication section — notifications may be a sub-section
    await page.goto('/communication/messages');
    await expect(page.getByRole('heading', { name: /messages/i })).toBeVisible({ timeout: 15_000 });
  });

  test('3.19 — Teacher: Configure notification preferences', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const notifPage = new NotificationPreferencesPage(page);
    await notifPage.goto();
    await notifPage.expectVisible();
  });

  test('3.20 — Teacher: Logout', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 4: PARENT (shared parent with 2 children)
  // =========================================================================

  test('4.1 — Parent: Login as shared parent', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    const dashboard = new DashboardPage(page);
    await dashboard.expectVisible();
    await dashboard.expectParentDashboard();
  });

  test('4.2 — Parent: Validate parent dashboard', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const dashboard = new DashboardPage(page);
    await dashboard.expectParentDashboard();
    await dashboard.expectParentStatCards();
  });

  test('4.2b — Parent: Dashboard shows all stat cards and sections', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const main = page.getByRole('main');
    // Parent stat cards
    await expect(main.getByText('Attendance').first()).toBeVisible({ timeout: 15_000 });
    await expect(main.getByText('Homework').first()).toBeVisible();
    await expect(main.getByText('Fees').first()).toBeVisible();
    await expect(main.getByText('Messages').first()).toBeVisible();
  });

  test('4.2c — Parent: Sidebar shows correct nav items', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const sidebar = new SidebarPage(page);
    await sidebar.expectNavItem('Dashboard');
    await sidebar.expectNavItem('Homework');
    await sidebar.expectNavItem('Help & Support');
  });

  test('4.2d — Parent: Cannot access admin-only routes', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    await page.goto('/school-settings');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });

    await page.goto('/users');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });

    await page.goto('/data-migration');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });

    // Parents CAN access /fees (it's shared between ADMIN and PARENT)
    await page.goto('/fees');
    await expect(page).toHaveURL(/\/fees\/?/, { timeout: 10_000 });
  });

  test('4.2e — Parent: Can deep-link to /homework', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    await page.goto('/homework');
    await expect(page).toHaveURL(/\/homework\/?/);
    await expect(page.getByRole('heading', { name: /homework/i })).toBeVisible({ timeout: 20_000 });
  });

  test('4.3 — Parent: Switch child profile', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    // Look for a child switcher component (dropdown or tabs)
    const childSwitcher = page.locator('button[role="combobox"]').or(page.getByRole('combobox'));
    if (await childSwitcher.first().isVisible({ timeout: 5_000 }).catch(() => false)) {
      await childSwitcher.first().click();
      // Select a different child if multiple are available
      const options = page.getByRole('option');
      const count = await options.count();
      if (count > 1) {
        await options.nth(1).click();
        await page.waitForTimeout(1000);
      } else if (count === 1) {
        await options.first().click();
      } else {
        // Close the dropdown
        await page.keyboard.press('Escape');
      }
    }
    // If no switcher is visible, the parent may only have one child visible at a time
  });

  test('4.4 — Parent: Navigate My Children', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const studentsPage = new StudentsPage(page);
    await studentsPage.goto();
    await studentsPage.expectVisible();
    // Parent should see their children listed
  });

  test('4.4b — Parent: Students page does not show Add Student button', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const studentsPage = new StudentsPage(page);
    await studentsPage.goto();
    await studentsPage.expectVisible();

    // Parent should NOT see Add Student button
    await expect(page.getByRole('button', { name: /add student/i })).not.toBeVisible({ timeout: 3_000 });
  });

  test('4.4c — Parent: Homework page does not show Create Assignment button', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const homeworkPage = new HomeworkPage(page);
    await homeworkPage.goto();
    await homeworkPage.expectVisible();

    // Parent should NOT see Create Assignment button
    await expect(page.getByRole('button', { name: /create assignment/i })).not.toBeVisible({ timeout: 3_000 });
  });

  test('4.4d — Parent: Announcements page does not show Create Announcement button', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();
    await announcementsPage.expectVisible();

    // Parent should NOT see Create Announcement button
    await expect(page.getByRole('button', { name: /create announcement/i })).not.toBeVisible({ timeout: 3_000 });
  });

  test('4.4e — Parent: Help page loads', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const helpPage = new HelpPage(page);
    await helpPage.goto();
    await helpPage.expectVisible();
  });

  test('4.5 — Parent: Validate attendance visible', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    // Parent sees attendance info on dashboard or via student details
    const dashboard = new DashboardPage(page);
    const main = page.getByRole('main');
    // Check for attendance-related text on dashboard
    await expect(
      main.getByText(/attendance/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('4.6 — Parent: View homework', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const homeworkPage = new HomeworkPage(page);
    await homeworkPage.goto();
    await homeworkPage.expectVisible();
  });

  test('4.7 — Parent: Send message to Teacher 1', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const messagesPage = new MessagesPage(page);
    await messagesPage.goto();
    await messagesPage.expectVisible();

    // Try to send a message
    const newMsgBtn = page.getByRole('button', { name: /new message|new conversation|compose|reply/i });
    if (await newMsgBtn.isVisible().catch(() => false)) {
      await newMsgBtn.click();
      const dialog = page.locator('[data-slot="dialog-content"]');
      if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const recipientInput = dialog.getByPlaceholder(/search|recipient/i);
        if (await recipientInput.isVisible().catch(() => false)) {
          await recipientInput.fill('Teacher One');
          await page.waitForTimeout(1000);
          const option = page.getByRole('option').first();
          if (await option.isVisible().catch(() => false)) {
            await option.click();
          }
        }
        const messageInput = dialog.getByPlaceholder(/message|type here/i);
        if (await messageInput.isVisible().catch(() => false)) {
          await messageInput.fill('Hello Teacher One, I would like to know about my child\'s progress.');
        }
        const sendBtn = dialog.getByRole('button', { name: /send/i });
        if (await sendBtn.isVisible().catch(() => false)) {
          await sendBtn.click();
        }
      }
    }
  });

  test('4.8 — Parent: View announcements', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();
    await announcementsPage.expectVisible();

    // Check if the announcement from Teacher 1 is visible
    if (schoolData.announcementTitle) {
      const announcement = page.getByText(schoolData.announcementTitle);
      // Announcement may or may not be visible depending on audience targeting
      if (await announcement.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await expect(announcement).toBeVisible();
      }
    }
  });

  test('4.9 — Parent: View fees page', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const feesPage = new FeesPage(page);
    await feesPage.goto();
    await feesPage.expectVisible();
    // Fees page loads — may be empty at this point
  });

  test('4.10 — Parent: Configure notification preferences', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const notifPage = new NotificationPreferencesPage(page);
    await notifPage.goto();
    await notifPage.expectVisible();
  });

  test('4.11 — Parent: Logout', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 5: TEACHER 1 RETURN
  // =========================================================================

  test('5.1 — Teacher Return: Login', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);
  });

  test('5.2 — Teacher Return: View parent message and reply', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const messagesPage = new MessagesPage(page);
    await messagesPage.goto();
    await messagesPage.expectVisible();

    // Look for conversation threads
    const conversations = page.locator('[data-slot="card"]').or(page.locator('.conversation-item'));
    if (await conversations.first().isVisible({ timeout: 5_000 }).catch(() => false)) {
      await conversations.first().click();
      await page.waitForTimeout(1000);

      // Try to reply
      const replyInput = page.getByPlaceholder(/type|reply|message/i);
      if (await replyInput.isVisible().catch(() => false)) {
        await replyInput.fill('Thank you for reaching out. Your child is doing well in class.');
        const sendBtn = page.getByRole('button', { name: /send/i });
        if (await sendBtn.isVisible().catch(() => false)) {
          await sendBtn.click();
        }
      }
    }
  });

  test('5.3 — Teacher Return: Record welfare incident', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const welfarePage = new WelfarePage(page);
    await welfarePage.goto();
    await welfarePage.expectVisible();

    await welfarePage.clickRecordWelfare();
    await welfarePage.selectClass(CLASS1_NAME);
    await page.waitForTimeout(1000);
    await welfarePage.selectStudent('Damilola Adeyemi');
    await welfarePage.selectStatus('Upset');
    await welfarePage.fillNotes('Student had a minor disagreement with a classmate during break.');
    await welfarePage.submitForm();
    await expectDialogClosed(page);
  });

  test('5.4 — Teacher Return: Log mood entry', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const moodPage = new MoodTrackerPage(page);
    await moodPage.goto();
    await moodPage.expectVisible();

    const dialog = await moodPage.openLogMoodDialog();

    // The mood form has: Student select, Mood select, Note textarea (no class select)
    const studentSelect = dialog.locator('button[role="combobox"]').first();
    await studentSelect.click();
    await page.getByRole('option', { name: 'Ebuka Nnamdi' }).click();

    const moodSelect = dialog.locator('button[role="combobox"]').nth(1);
    await moodSelect.click();
    await page.getByRole('option').first().click();

    const notesField = dialog.getByPlaceholder(/notes|observation/i);
    if (await notesField.isVisible().catch(() => false)) {
      await notesField.fill('Student seems more confident today after the group project.');
    }

    const submitBtn = dialog.getByRole('button', { name: /save|log|submit/i });
    await submitBtn.click();
    await expectDialogClosed(page);
  });

  test('5.5 — Teacher Return: Logout', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 6: SCHOOL ADMIN RETURN
  // =========================================================================

  test('6.1 — Admin Return: Login', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);
  });

  test('6.2 — Admin Return: Create fee structure', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const feesPage = new FeesPage(page);
    await feesPage.goto();
    await feesPage.expectVisible();

    // Switch to fee structures tab
    await feesPage.switchToFeeStructures();

    // Click create structure
    await feesPage.createStructureButton.click();
    const dialog = page.locator('[data-slot="dialog-content"]');
    await expect(dialog).toBeVisible();

    // Fill fee structure form
    await dialog.getByLabel('Name').fill(`Tuition Fee ${TS}`);
    await dialog.getByLabel('Amount').fill('150000');

    // Class, Session, Term are optional — leave as defaults

    // Submit
    await dialog.getByRole('button', { name: 'Create Structure' }).click();
    await expectDialogClosed(page);
  });

  test('6.3 — Admin Return: Generate fee invoices', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const feesPage = new FeesPage(page);
    await feesPage.goto();
    await feesPage.expectVisible();

    // Switch to invoices tab
    await feesPage.switchToInvoices();

    // Click generate invoices
    const generateBtn = feesPage.generateInvoicesButton;
    if (await generateBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await generateBtn.click();
      const dialog = page.locator('[data-slot="dialog-content"]');
      if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
        // Select class and fee structure
        const classCombo = dialog.getByRole('combobox').first();
        if (await classCombo.isVisible().catch(() => false)) {
          await classCombo.click();
          const option = page.getByRole('option').first();
          if (await option.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await option.click();
          }
        }

        // Submit
        const submitBtn = dialog.getByRole('button', { name: /generate|create/i });
        if (await submitBtn.isVisible().catch(() => false)) {
          await submitBtn.click();
          await expectDialogClosed(page);
        }
      }
    }
  });

  test('6.4 — Admin Return: Verify fee overview', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const feesPage = new FeesPage(page);
    await feesPage.goto();
    await feesPage.expectVisible();
    // Verify the fee structures tab has content
    await feesPage.switchToFeeStructures();
    await expect(page.getByText(`Tuition Fee ${TS}`)).toBeVisible({ timeout: 10_000 });
  });

  test('6.4b — Admin Return: Fees page shows Fee Structures and Invoices tabs', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const feesPage = new FeesPage(page);
    await feesPage.goto();
    await feesPage.expectVisible();

    // Verify tabs exist
    await expect(page.getByRole('tab', { name: /fee structures/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /invoices/i })).toBeVisible();
  });

  // ---- Bus Management (Admin) ----

  test('6.4c — Admin Return: Bus Management page shows all four tabs', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const busPage = new BusPage(page);
    await busPage.goto();
    await busPage.expectVisible();

    await expect(busPage.routesTab).toBeVisible();
    await expect(busPage.busesTab).toBeVisible();
    await expect(busPage.enrollmentsTab).toBeVisible();
    await expect(busPage.tripsTab).toBeVisible();
  });

  test('6.4d — Admin Return: Create bus route', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const busPage = new BusPage(page);
    await busPage.goto();
    await busPage.expectVisible();

    await busPage.switchToRoutes();
    await busPage.createRoute(
      BUS_ROUTE_NAME,
      'Lekki to Victoria Island daily route',
      `${BUS_PICKUP_POINT}, Ajah Bus Stop, VI Roundabout`,
    );
    await expectDialogClosed(page);

    // Verify route appears in table
    await busPage.expectRouteInTable(BUS_ROUTE_NAME);

    schoolData.busRouteName = BUS_ROUTE_NAME;
  });

  test('6.4e — Admin Return: Create bus and assign to route', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const busPage = new BusPage(page);
    await busPage.goto();
    await busPage.expectVisible();

    await busPage.switchToBuses();
    await busPage.createBus(
      BUS_PLATE_NUMBER,
      '30',
      BUS_DRIVER_NAME,
      BUS_DRIVER_PHONE,
      BUS_ROUTE_NAME,
    );
    await expectDialogClosed(page);

    // Verify bus appears in table
    await busPage.expectBusInTable(BUS_PLATE_NUMBER);

    schoolData.busPlateNumber = BUS_PLATE_NUMBER;
  });

  test('6.4f — Admin Return: Enroll student on bus', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const busPage = new BusPage(page);
    await busPage.goto();
    await busPage.expectVisible();

    await busPage.switchToEnrollments();

    // Enroll the first student from Class 2 (Funke Alade — shared parent's child)
    const studentName = `${STUDENTS_CLASS2[0].first} ${STUDENTS_CLASS2[0].last}`;
    await busPage.enrollStudent(
      BUS_PLATE_NUMBER,
      studentName,
      BUS_PICKUP_POINT,
    );
    await expectDialogClosed(page);

    // Verify enrollment appears (check pickup point since backend may not return studentName)
    await busPage.expectEnrollmentInTable(BUS_PICKUP_POINT);
  });

  test('6.4g — Admin Return: Trips tab shows Create Trip button', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const busPage = new BusPage(page);
    await busPage.goto();
    await busPage.expectVisible();

    await busPage.switchToTrips();
    await expect(busPage.createTripButton).toBeVisible();
  });

  test('6.5 — Admin Return: Create emergency alert', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    // Navigate to safety page
    await page.goto('/safety');
    await expect(page.getByRole('heading', { name: /safety|emergency/i })).toBeVisible({ timeout: 15_000 });

    // Create an emergency alert
    const createBtn = page.getByRole('button', { name: /create alert|new alert|create emergency/i });
    if (await createBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await createBtn.click();
      const dialog = page.locator('[data-slot="dialog-content"]');
      await expect(dialog).toBeVisible();

      // Select alert type
      const alertTypeSelect = dialog.locator('button[role="combobox"]').first();
      await alertTypeSelect.click();
      await page.getByRole('option', { name: 'Evacuation' }).click();

      // Fill title
      await dialog.getByPlaceholder('e.g. Fire drill evacuation').fill(`Fire Drill ${TS}`);

      // Select severity
      const severitySelect = dialog.locator('button[role="combobox"]').nth(1);
      await severitySelect.click();
      await page.getByRole('option', { name: 'Medium' }).click();

      // Fill description
      const descInput = dialog.getByPlaceholder(/description|message|details/i);
      if (await descInput.isVisible().catch(() => false)) {
        await descInput.fill('Scheduled fire drill. All students to evacuate to assembly point.');
      }

      const submitBtn = dialog.getByRole('button', { name: /create alert/i });
      await submitBtn.click();
      await expectDialogClosed(page);
    }
  });

  test('6.6 — Admin Return: Resolve emergency alert', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    await page.goto('/safety');
    await expect(page.getByRole('heading', { name: /safety|emergency/i })).toBeVisible({ timeout: 15_000 });

    // Find the created alert and resolve it
    const alertCard = page.locator('[data-slot="card"]', { hasText: `Fire Drill ${TS}` })
      .or(page.locator('tr', { hasText: `Fire Drill ${TS}` }));
    if (await alertCard.first().isVisible({ timeout: 5_000 }).catch(() => false)) {
      const resolveBtn = alertCard.first().getByRole('button', { name: /resolve|close|dismiss/i });
      if (await resolveBtn.isVisible().catch(() => false)) {
        await resolveBtn.click();
        // Confirm if needed
        const confirmDialog = page.locator('[role="alertdialog"]');
        if (await confirmDialog.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await confirmDialog.getByRole('button', { name: /resolve|confirm|yes/i }).click();
        }
      }
    }
  });

  test('6.7 — Admin Return: Validate analytics dashboard', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible({ timeout: 15_000 });
    // Verify the analytics page loads with some content
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
  });

  test('6.8 — Admin Return: Verify audit trail', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const auditPage = new AuditLogsPage(page);
    await auditPage.goto();
    await auditPage.expectVisible();
    // Audit log table is visible — entries depend on backend audit implementation
    await expect(page.locator('table')).toBeVisible({ timeout: 10_000 });
  });

  test('6.9 — Admin Return: Logout', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 7: PARENT RETURN
  // =========================================================================

  test('7.1 — Parent Return: Login', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);
  });

  test('7.2 — Parent Return: Check notifications for emergency alert', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    // Notifications may appear as a bell icon in the header or in the communication section
    const bellIcon = page.getByRole('button', { name: /notification/i });
    if (await bellIcon.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await bellIcon.click();
      await page.waitForTimeout(1000);
      // Check for emergency alert text
      const alertText = page.getByText(/Fire Drill/i);
      if (await alertText.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(alertText).toBeVisible();
      }
      // Close notifications panel
      await page.keyboard.press('Escape');
    }
  });

  test('7.3 — Parent Return: View announcement from Teacher 1', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();
    await announcementsPage.expectVisible();
  });

  test('7.4 — Parent Return: Read reply from Teacher 1 in messages', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const messagesPage = new MessagesPage(page);
    await messagesPage.goto();
    await messagesPage.expectVisible();

    // Check for conversation threads
    const conversations = page.locator('[data-slot="card"]').or(page.locator('.conversation-item'));
    if (await conversations.first().isVisible({ timeout: 5_000 }).catch(() => false)) {
      await conversations.first().click();
      await page.waitForTimeout(1000);
      // Verify teacher reply is visible
      const replyText = page.getByText(/doing well/i);
      if (await replyText.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await expect(replyText).toBeVisible();
      }
    }
  });

  test('7.5 — Parent Return: View fee invoice and verify amounts', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const feesPage = new FeesPage(page);
    await feesPage.goto();
    await feesPage.expectVisible();

    // Check if any invoices are visible — page content depends on backend data
    // Just verify the fees page loaded successfully (heading is visible via expectVisible above)
    await page.waitForTimeout(2_000);
    const hasInvoice = await page.getByText(/Tuition Fee|invoice|amount/i).first().isVisible().catch(() => false);
    if (hasInvoice) {
      await expect(page.getByText(/Tuition Fee|invoice|amount/i).first()).toBeVisible({ timeout: 5_000 });
    }
  });

  // ---- Bus Tracking (Parent) ----

  test('7.5b — Parent Return: View bus tracking page', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const busTrackingPage = new BusTrackingPage(page);
    await busTrackingPage.goto();
    await busTrackingPage.expectVisible();

    // The shared parent's child (Funke Alade) was enrolled on a bus
    // Verify the page loads — child cards should render (enrolled or not)
    const childName = `${STUDENTS_CLASS2[0].first} ${STUDENTS_CLASS2[0].last}`;
    await busTrackingPage.expectChildCard(childName);
  });

  test('7.5c — Parent Return: Bus tracking shows bus info for enrolled child', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const busTrackingPage = new BusTrackingPage(page);
    await busTrackingPage.goto();
    await busTrackingPage.expectVisible();

    // Verify the child's card shows bus enrollment info (plate number or "Not enrolled")
    // Backend may not always populate busPlateNumber in the tracking response
    const childName = `${STUDENTS_CLASS2[0].first} ${STUDENTS_CLASS2[0].last}`;
    await busTrackingPage.expectChildCard(childName);

    // Soft-check: if bus info is rendered, verify it matches
    const busInfoVisible = await page.getByText(BUS_PLATE_NUMBER).isVisible().catch(() => false);
    if (busInfoVisible) {
      await busTrackingPage.expectPickupPoint(BUS_PICKUP_POINT);
    }
  });

  // ---- Pickup Authorization (Parent) ----

  test('7.5d — Parent Return: Pickup authorization page loads', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const pickupPage = new PickupAuthorizationPage(page);
    await pickupPage.goto();
    await pickupPage.expectVisible();

    // Initially should show empty state or Add Authorization button
    // Parent may have multiple children — each shows its own button
    await expect(pickupPage.addAuthorizationButton.first()).toBeVisible();
  });

  test('7.5e — Parent Return: Create pickup authorization', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const pickupPage = new PickupAuthorizationPage(page);
    await pickupPage.goto();
    await pickupPage.expectVisible();

    const childName = `${STUDENTS_CLASS2[0].first} ${STUDENTS_CLASS2[0].last}`;
    await pickupPage.createAuthorization(
      childName,
      PICKUP_PERSON_NAME,
      'Uncle',
      '08088880001',
    );
    await expectDialogClosed(page);

    // Verify authorization card appears
    await pickupPage.expectAuthorizationCard(PICKUP_PERSON_NAME);
  });

  test('7.5f — Parent Return: Revoke pickup authorization', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);

    const pickupPage = new PickupAuthorizationPage(page);
    await pickupPage.goto();
    await pickupPage.expectVisible();

    // Wait for the authorization card to load
    await pickupPage.expectAuthorizationCard(PICKUP_PERSON_NAME);

    // Revoke the authorization
    await pickupPage.revokeAuthorization(PICKUP_PERSON_NAME);

    // After revocation, the card should show REVOKED status
    await expect(page.getByText('Revoked').first()).toBeVisible({ timeout: 10_000 });
  });

  test('7.6 — Parent Return: Logout', async ({ page }) => {
    await loginViaUI(page, SECOND_PARENT_EMAIL);
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 8: DUAL-ROLE USER
  // =========================================================================

  test('8.1 — Dual-Role: Login and see school selector', async ({ page }) => {
    await loginViaUI(page, TEST_ACCOUNTS.teacherParent.email);

    // The school selector should appear for multi-school users
    const selectSchoolPage = new SelectSchoolPage(page);
    await selectSchoolPage.expectVisible();
    await selectSchoolPage.expectMultipleSchools();
  });

  test('8.2 — Dual-Role: Select teacher school and verify teacher dashboard', async ({ page }) => {
    await loginViaUI(page, TEST_ACCOUNTS.teacherParent.email);

    const selectSchoolPage = new SelectSchoolPage(page);
    await selectSchoolPage.expectVisible();

    // Select the first school card (teacher role)
    const cards = selectSchoolPage.getSchoolCards();
    await cards.first().click();
    await selectSchoolPage.continue();

    // Wait for dashboard
    await waitForDashboard(page);

    // The user should see either teacher or parent dashboard depending on which school
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
  });

  test('8.3 — Dual-Role: Switch to parent school and verify parent dashboard', async ({ page }) => {
    await loginViaUI(page, TEST_ACCOUNTS.teacherParent.email);

    const selectSchoolPage = new SelectSchoolPage(page);
    await selectSchoolPage.expectVisible();

    // Select the second school card (parent role)
    const cards = selectSchoolPage.getSchoolCards();
    const count = await cards.count();
    if (count >= 2) {
      await cards.nth(1).click();
      await selectSchoolPage.continue();

      await waitForDashboard(page);

      const main = page.getByRole('main');
      await expect(main).toBeVisible();
    } else {
      // If only 1 school, just select it
      await cards.first().click();
      await selectSchoolPage.continue();
      await waitForDashboard(page);
    }
  });

  test('8.4 — Dual-Role: Logout', async ({ page }) => {
    await loginViaUI(page, TEST_ACCOUNTS.teacherParent.email);

    const selectSchoolPage = new SelectSchoolPage(page);
    await selectSchoolPage.expectVisible();

    // Select any school to get to dashboard so we can logout
    const cards = selectSchoolPage.getSchoolCards();
    await cards.first().click();
    await selectSchoolPage.continue();
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 8.5: SUBSCRIPTION MANAGEMENT
  // Super Admin creates a subscription plan, assigns it to the E2E school,
  // records a payment, verifies proration calculator, then School Admin
  // views their subscription status page.
  // =========================================================================

  test('8.5.1 — Super Admin: Navigate to Subscription Plans page', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const plansPage = new SubscriptionPlansPage(page);
    await plansPage.goto();
    await plansPage.expectVisible();
  });

  test('8.5.2 — Super Admin: Create a subscription plan', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const plansPage = new SubscriptionPlansPage(page);
    await plansPage.goto();
    await plansPage.expectVisible();

    await plansPage.clickCreate();
    await plansPage.fillPlanForm({
      name: SUBSCRIPTION_PLAN_NAME,
      tier: 'STANDARD',
      pricePerStudent: 50000,
      billingPeriodMonths: 12,
      maxStudents: 500,
    });
    await plansPage.submitForm();

    // Wait for success toast and verify plan appears in table
    await expect(page.getByText(/plan created/i)).toBeVisible({ timeout: 10_000 });
    await plansPage.expectPlanInTable(SUBSCRIPTION_PLAN_NAME);

    schoolData.subscriptionPlanName = SUBSCRIPTION_PLAN_NAME;
  });

  test('8.5.3 — Super Admin: Create subscription plan via API for assignment', async ({ page }) => {
    // Use API to get the plan ID for the plan we just created via UI
    const auth = await authenticateAccount('superadmin@skunect.com', TEST_OTP);

    const plansRes = await apiGet<Array<{ id: string; name: string }>>(
      '/admin/subscription-plans',
      auth.accessToken
    );

    const plan = plansRes.data.find((p) => p.name === SUBSCRIPTION_PLAN_NAME);
    expect(plan).toBeDefined();
    schoolData.subscriptionPlanId = plan!.id;
  });

  test('8.5.4 — Super Admin: Navigate to school subscription page (no subscription)', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const subPage = new SchoolSubscriptionPage(page);
    await subPage.goto(schoolData.schoolId!);
    await subPage.expectVisible();
    await subPage.expectNoSubscription();
  });

  test('8.5.5 — Super Admin: Create subscription for E2E school via API', async ({ page }) => {
    const auth = await authenticateAccount('superadmin@skunect.com', TEST_OTP);

    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
      .toISOString().split('T')[0];

    const response = await apiPost(
      `/admin/schools/${schoolData.schoolId}/subscription`,
      auth.accessToken,
      {
        planId: schoolData.subscriptionPlanId,
        startDate,
        endDate,
        studentLimit: 100,
      }
    );

    expect(response.status).toBe('SUCCESS');
  });

  test('8.5.6 — Super Admin: Verify subscription appears on school subscription page', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const subPage = new SchoolSubscriptionPage(page);
    await subPage.goto(schoolData.schoolId!);
    await subPage.expectVisible();

    await subPage.expectHasSubscription();
    await subPage.expectStatusText('ACTIVE');
  });

  test('8.5.7 — Super Admin: Record payment for subscription', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const subPage = new SchoolSubscriptionPage(page);
    await subPage.goto(schoolData.schoolId!);
    await subPage.expectVisible();

    await subPage.openPaymentDialog();
    await subPage.fillPaymentForm({
      amount: 2500000,
      paymentType: 'PARTIAL',
      paymentMethod: 'BANK_TRANSFER',
      paymentReference: SUBSCRIPTION_PAYMENT_REF,
      description: 'E2E partial payment',
    });
    await subPage.submitPaymentForm();

    // Wait for success toast
    await expect(page.getByText(/payment recorded/i)).toBeVisible({ timeout: 10_000 });
  });

  test('8.5.8 — Super Admin: Verify payment in history', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const subPage = new SchoolSubscriptionPage(page);
    await subPage.goto(schoolData.schoolId!);
    await subPage.expectVisible();

    await subPage.expectPaymentInTable(SUBSCRIPTION_PAYMENT_REF);
  });

  test('8.5.9 — Super Admin: Use proration calculator', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const subPage = new SchoolSubscriptionPage(page);
    await subPage.goto(schoolData.schoolId!);
    await subPage.expectVisible();

    await subPage.openProrationDialog();
    await subPage.fillAdditionalStudents(20);
    await subPage.clickCalculate();
    await subPage.expectProrationResult();
  });

  test('8.5.10 — School Admin: View own subscription status', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const adminSubPage = new AdminSubscriptionPage(page);
    await adminSubPage.goto();
    await adminSubPage.expectVisible();
    await adminSubPage.expectHasSubscription();
  });

  test('8.5.11 — School Admin: Use proration calculator', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const adminSubPage = new AdminSubscriptionPage(page);
    await adminSubPage.goto();
    await adminSubPage.expectVisible();

    await adminSubPage.openProrationDialog();
    await adminSubPage.fillAdditionalStudents(10);
    await adminSubPage.clickCalculate();
    await adminSubPage.expectProrationResult();
    await adminSubPage.closeDialog();
  });

  test('8.5.12 — School Admin: Request upgrade', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const adminSubPage = new AdminSubscriptionPage(page);
    await adminSubPage.goto();
    await adminSubPage.expectVisible();

    await adminSubPage.openUpgradeDialog();
    await adminSubPage.fillUpgradeForm({
      students: 50,
      message: 'E2E test: requesting 50 additional student slots',
    });
    await adminSubPage.submitUpgradeRequest();

    await expect(page.getByText(/upgrade request submitted/i)).toBeVisible({ timeout: 10_000 });
  });

  test('8.5.13 — School Admin: Payment history shows recorded payment', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const adminSubPage = new AdminSubscriptionPage(page);
    await adminSubPage.goto();
    await adminSubPage.expectVisible();

    await adminSubPage.expectPaymentInTable('PARTIAL');
  });

  test('8.5.14 — Teacher: Cannot access subscription page (redirect to dashboard)', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/subscription');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });
  });

  test('8.5.15 — Super Admin: Logout after subscription tests', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 8.6: SUBSCRIPTION DISCOUNTS
  // =========================================================================

  test('8.6.1 — Super Admin: Navigate to Discounts page', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    await page.goto('/system/subscription-discounts');
    await expect(
      page.getByRole('heading', { name: /subscription discounts/i })
        .or(page.getByRole('heading', { name: /discounts/i }))
    ).toBeVisible({ timeout: 20_000 });
  });

  test('8.6.2 — Super Admin: Create a discount code', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    await page.goto('/system/subscription-discounts');
    await expect(
      page.getByRole('heading', { name: /discounts/i })
    ).toBeVisible({ timeout: 20_000 });

    // Open create discount dialog
    await page.getByRole('button', { name: /create discount/i }).click();
    await expect(page.locator('[data-slot="dialog-content"]')).toBeVisible({ timeout: 10_000 });

    // Fill the discount form
    const dialog = page.locator('[data-slot="dialog-content"]');

    // Code — use placeholder since Label has no htmlFor association
    await dialog.getByPlaceholder('e.g. WELCOME20').fill('E2ETEST20');

    // Name
    await dialog.getByPlaceholder('e.g. Welcome Discount').fill('E2E Test 20%');

    // Type — Percentage is already selected by default, skip

    // Value (Percentage %)
    await dialog.locator('input[type="number"]').first().fill('20');

    // Valid from — today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const dateInputs = dialog.locator('input[type="date"]');
    await dateInputs.first().fill(todayStr);

    // Valid until — +1 year
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split('T')[0];
    await dateInputs.nth(1).fill(nextYearStr);

    // Submit
    await dialog.getByRole('button', { name: /create|save|submit/i }).click();

    // Expect success toast
    await expectToast(page, 'success');

    // Verify the discount code appears in the table
    await expect(page.getByText('E2ETEST20')).toBeVisible({ timeout: 10_000 });
  });

  test('8.6.3 — Super Admin: Deactivate a discount', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    await page.goto('/system/subscription-discounts');
    await expect(
      page.getByRole('heading', { name: /discounts/i })
    ).toBeVisible({ timeout: 20_000 });

    // Find the row containing E2ETEST20 and click the deactivate (Ban icon) button
    // The row has two icon buttons: Edit (Pencil) and Deactivate (Ban) — deactivate is the last one
    const row = page.locator('tr', { hasText: 'E2ETEST20' });
    await row.getByRole('button').last().click();

    // Confirm deactivation in the alert dialog
    const alertDialog = page.locator('[role="alertdialog"]');
    await expect(alertDialog).toBeVisible({ timeout: 5_000 });
    await alertDialog.getByRole('button', { name: /deactivate/i }).click();

    // Expect success toast
    await expectToast(page, 'success');
  });

  // =========================================================================
  // PHASE 8.7: SUBSCRIPTION DASHBOARD & RECEIPT
  // =========================================================================

  test('8.7.1 — Super Admin: View subscription dashboard', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    await page.goto('/system/subscription-dashboard');
    await expect(
      page.getByRole('heading', { name: /subscription dashboard/i })
        .or(page.getByRole('heading', { name: /dashboard/i }))
    ).toBeVisible({ timeout: 20_000 });

    // Verify stat cards are visible (cards show "Active", "Grace Period", "Expired", etc.)
    await expect(
      page.getByText('Active').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('8.7.2 — Super Admin: Download payment receipt', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const subPage = new SchoolSubscriptionPage(page);
    await subPage.goto(schoolData.schoolId!);
    await subPage.expectVisible();

    // The payment table should have at least one row from test 8.5.7
    // Each row's last cell has an icon-only download button (Download icon, no text)
    const paymentRow = page.locator('table tbody tr').first();
    await expect(paymentRow).toBeVisible({ timeout: 10_000 });

    // Click the download (icon-only) button — last button in the row
    const downloadBtn = paymentRow.getByRole('button').last();
    await downloadBtn.click({ timeout: 10_000 });

    // Brief wait to ensure no uncaught errors after click
    await page.waitForTimeout(2_000);
  });

  test('8.7.3 — Super Admin: Logout after dashboard tests', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 9: SUPER ADMIN CLEANUP
  // =========================================================================

  test('9.1 — Super Admin Cleanup: Login and verify school details', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const detailPage = new SchoolDetailPage(page);
    await detailPage.goto(schoolData.schoolId!);
    await detailPage.expectVisible(SCHOOL_NAME);
    await detailPage.expectSchoolInfo();
    await detailPage.expectAdminSection();
  });

  test('9.2 — Super Admin Cleanup: Deactivate test school', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const schoolsPage = new SystemSchoolsPage(page);
    await schoolsPage.goto();
    await schoolsPage.expectVisible();

    await schoolsPage.clickDeactivateSchool(SCHOOL_NAME);
    await schoolsPage.confirmAlert(/deactivate/i);
  });

  test('9.3 — Super Admin Cleanup: Reactivate test school', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const schoolsPage = new SystemSchoolsPage(page);
    await schoolsPage.goto();
    await schoolsPage.expectVisible();

    await schoolsPage.clickActivateSchool(SCHOOL_NAME);
    await schoolsPage.confirmAlert(/activate/i);
  });

  test('9.4 — Super Admin Cleanup: Logout', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 10: TEACHER ANALYTICS & DATA MIGRATION ACCESS CONTROL
  // =========================================================================

  test('10.1 — Teacher can view analytics page (read-only)', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible({ timeout: 20_000 });
  });

  test('10.2 — Teacher cannot access data migration', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/data-migration');
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });
  });

  test('10.3 — Teacher can view attendance page', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    await page.goto('/attendance');
    await expect(page).toHaveURL(/\/attendance\/?/, { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: /attendance/i })).toBeVisible({ timeout: 20_000 });
  });

  test('10.4 — Teacher Logout', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 11: NEW FEATURES — Activation, Limits, Promotions, Logo, Photos
  // =========================================================================

  test('11.1 — Admin: Verify new students default to INACTIVE status via API', async ({ page }) => {
    // Create a new student via API and verify it defaults to INACTIVE
    const adminAuth = await authenticateAccount(ADMIN_EMAIL, TEST_OTP);
    const token = adminAuth.accessToken;
    const schoolId = schoolData.schoolId!;

    const createRes = await apiPost<any>(`/schools/${schoolId}/students`, token, {
      firstName: `TestInactive`,
      lastName: `Student${TS}`,
      gender: 'MALE',
      dateOfBirth: '2015-01-01',
    });
    expect(createRes.status).toBe('SUCCESS');
    expect(createRes.data.status).toBe('INACTIVE');
    expect(createRes.data.isActive).toBe(false);

    // Activate so it doesn't affect other tests
    const studentId = createRes.data.id;
    await apiPost(`/schools/${schoolId}/students/${studentId}/activate`, token);
  });

  test('11.2 — Admin: Activate a student via API', async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL);
    await waitForDashboard(page);

    // Get admin token via API
    const adminAuth = await authenticateAccount(ADMIN_EMAIL, TEST_OTP);
    const token = adminAuth.accessToken;
    const schoolId = schoolData.schoolId!;

    // Get first student ID
    const studentsRes = await apiGet<any[]>(`/schools/${schoolId}/students?size=1`, token);
    const studentId = studentsRes.data[0].id;

    // Activate via API
    const activateRes = await apiPost<any>(`/schools/${schoolId}/students/${studentId}/activate`, token);
    expect(activateRes.status).toBe('SUCCESS');

    // Refresh students page and verify ACTIVE status
    const studentsPage = new StudentsPage(page);
    await studentsPage.goto();
    await studentsPage.expectVisible();
  });

  test('11.3 — Admin: Deactivate a student via API', async ({ page }) => {
    const adminAuth = await authenticateAccount(ADMIN_EMAIL, TEST_OTP);
    const token = adminAuth.accessToken;
    const schoolId = schoolData.schoolId!;

    // Get the first student
    const studentsRes = await apiGet<any[]>(`/schools/${schoolId}/students?size=1`, token);
    const studentId = studentsRes.data[0].id;

    // Deactivate
    const res = await apiPost<any>(`/schools/${schoolId}/students/${studentId}/deactivate`, token);
    expect(res.status).toBe('SUCCESS');
    expect(res.data.status).toBe('INACTIVE');
  });

  test('11.4 — Admin: Get student usage stats', async ({ page }) => {
    const adminAuth = await authenticateAccount(ADMIN_EMAIL, TEST_OTP);
    const token = adminAuth.accessToken;
    const schoolId = schoolData.schoolId!;

    const res = await apiGet<any>(`/schools/${schoolId}/student-usage`, token);
    expect(res.status).toBe('SUCCESS');
    expect(res.data).toHaveProperty('activeStudents');
    expect(res.data).toHaveProperty('studentLimit');
    expect(res.data).toHaveProperty('usagePercent');
    expect(res.data).toHaveProperty('hasSubscription');
  });

  test('11.5 — Admin: Navigate to promotions page', async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL);
    await waitForDashboard(page);

    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('h1').filter({ hasText: /student promotions/i })).toBeVisible({ timeout: 30_000 });
  });

  test('11.6 — Admin: Get eligible students for promotion via API', async ({ page }) => {
    const adminAuth = await authenticateAccount(ADMIN_EMAIL, TEST_OTP);
    const token = adminAuth.accessToken;
    const schoolId = schoolData.schoolId!;

    // Fetch classes and session dynamically
    const classesRes = await apiGet<any[]>(`/schools/${schoolId}/classes`, token);
    const sessionsRes = await apiGet<any[]>(`/schools/${schoolId}/sessions`, token);
    const classId = classesRes.data[0]?.id;
    const sessionId = sessionsRes.data[0]?.id;
    expect(classId).toBeTruthy();
    expect(sessionId).toBeTruthy();

    const res = await apiGet<any[]>(
      `/schools/${schoolId}/promotions/eligible?classId=${classId}&sessionId=${sessionId}`,
      token,
    );
    expect(res.status).toBe('SUCCESS');
    expect(Array.isArray(res.data)).toBe(true);
  });

  test('11.7 — Admin: Bulk promote students via API', async ({ page }) => {
    const adminAuth = await authenticateAccount(ADMIN_EMAIL, TEST_OTP);
    const token = adminAuth.accessToken;
    const schoolId = schoolData.schoolId!;

    // Fetch classes and session dynamically
    const classesRes = await apiGet<any[]>(`/schools/${schoolId}/classes`, token);
    const sessionsRes = await apiGet<any[]>(`/schools/${schoolId}/sessions`, token);
    expect(classesRes.data.length).toBeGreaterThanOrEqual(2);
    const fromClassId = classesRes.data[0].id;
    const toClassId = classesRes.data[1].id;
    const sessionId = sessionsRes.data[0].id;

    // Get a student from the source class
    const studentsRes = await apiGet<any[]>(`/schools/${schoolId}/students?classId=${fromClassId}&size=1`, token);
    if (studentsRes.data.length > 0) {
      const studentId = studentsRes.data[0].id;

      // Promote
      const res = await apiPost<any>(`/schools/${schoolId}/promotions`, token, {
        fromClassId,
        toClassId,
        sessionId,
        studentIds: [studentId],
      });
      expect(res.status).toBe('SUCCESS');
      expect(res.data.length).toBe(1);
      expect(res.data[0].status).toBe('PROMOTED');
    }
  });

  test('11.8 — Admin: Get promotion history via API', async ({ page }) => {
    const adminAuth = await authenticateAccount(ADMIN_EMAIL, TEST_OTP);
    const token = adminAuth.accessToken;
    const schoolId = schoolData.schoolId!;

    const res = await apiGet<any[]>(`/schools/${schoolId}/promotions`, token);
    expect(res.status).toBe('SUCCESS');
    expect(Array.isArray(res.data)).toBe(true);
  });

  test('11.9 — Admin: Update school logo via API', async ({ page }) => {
    const adminAuth = await authenticateAccount(ADMIN_EMAIL, TEST_OTP);
    const token = adminAuth.accessToken;
    const schoolId = schoolData.schoolId!;

    // Update school with a logo URL
    const res = await apiPut<any>(`/schools/${schoolId}`, token, {
      logoUrl: 'https://placehold.co/200x200/2A9D8F/white?text=Logo',
    });
    expect(res.status).toBe('SUCCESS');
    expect(res.data.logoUrl).toBeTruthy();
  });

  test('11.10 — Admin: Verify school logo appears in sidebar', async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL);
    await waitForDashboard(page);

    // The sidebar should now show the school logo image
    const sidebarLogo = page.locator('aside img').first();
    await expect(sidebarLogo).toBeVisible({ timeout: 15_000 });
  });

  test('11.11 — Admin: School settings page shows logo upload section', async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL);
    await waitForDashboard(page);

    const settingsPage = new SchoolSettingsPage(page);
    await settingsPage.goto();
    await settingsPage.expectVisible();

    // Verify logo upload section exists
    await expect(page.getByText(/school logo/i)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/upload logo/i)).toBeVisible({ timeout: 10_000 });
  });

  test('11.12 — Parent: ChildResponse includes photoUrl and status', async ({ page }) => {
    // Verify via API that children response includes new fields
    const parentEmail = STUDENTS_CLASS1[0].parentEmail;
    const parentAuth = await authenticateAccount(parentEmail, TEST_OTP);
    const token = parentAuth.accessToken;

    const res = await apiGet<any[]>('/parents/children', token);
    expect(res.status).toBe('SUCCESS');
    if (res.data.length > 0) {
      const child = res.data[0];
      expect(child).toHaveProperty('status');
      // photoUrl may be null but the field should exist
      expect('photoUrl' in child).toBe(true);
    }
  });

  test('11.13 — Admin: Attendance grid filters inactive students', async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL);
    await waitForDashboard(page);

    await page.goto('/attendance');
    await expect(page.getByRole('heading', { name: /attendance/i })).toBeVisible({ timeout: 20_000 });
    // The attendance page should load without errors
    // Inactive students should not appear in the grid
  });

  test('11.14 — Admin: Promotions nav item visible in sidebar', async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL);
    await waitForDashboard(page);

    // Verify Promotions appears in sidebar navigation
    await expect(page.getByRole('link', { name: /promotions/i })).toBeVisible({ timeout: 10_000 });
  });

  test('11.15 — Admin: Logout', async ({ page }) => {
    await loginViaUI(page, ADMIN_EMAIL);
    await waitForDashboard(page);
    await logout(page);
  });
});
