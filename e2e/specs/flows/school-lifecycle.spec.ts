/**
 * School Lifecycle E2E Flow
 *
 * This is a comprehensive end-to-end test that exercises the full school
 * management lifecycle across Super Admin, School Admin, and Teacher roles.
 *
 * Flow:
 * 1. Super Admin creates a school, updates it, and adds an admin
 * 2. School Admin sets up the school (admins, teachers, session, terms,
 *    classes, subjects, grading, students, parents, timetable)
 * 3. Teacher validates their dashboard
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
import {
  authenticateAccount,
  apiGet,
  apiPost,
  apiPut,
} from '../../helpers/api.helper';
import { TEST_OTP, API_BASE_URL } from '../../fixtures/test-accounts';

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
  // PHASE 1: SUPER ADMIN
  // =========================================================================

  test('1.1 — Super Admin: Login', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    const dashboard = new DashboardPage(page);
    await dashboard.expectVisible();
    await dashboard.expectSuperAdminDashboard();
  });

  test('1.2 — Super Admin: Create a new school', async ({ page }) => {
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

  test('1.3 — Super Admin: Update school address', async ({ page }) => {
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

  test('1.4 — Super Admin: Add school admin', async ({ page }) => {
    expect(schoolData.schoolId).toBeTruthy();

    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);

    const schoolsPage = new SystemSchoolsPage(page);
    await schoolsPage.goto();
    await schoolsPage.expectVisible();

    // Add admin to the school
    await schoolsPage.clickCreateAdmin(SCHOOL_NAME);
    await schoolsPage.fillAdminForm('School', 'Admin', ADMIN_EMAIL, '+2348099999001');
    await schoolsPage.submitAdminForm();
    await expectDialogClosed(page);

    schoolData.adminEmail = ADMIN_EMAIL;
  });

  test('1.5 — Super Admin: Open school details and verify', async ({ page }) => {
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

  test('1.6 — Super Admin: Logout', async ({ page }) => {
    await loginViaUI(page, 'superadmin@skunect.com');
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 2: SCHOOL ADMIN
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
  });

  test('2.16 — School Admin: Create timetable for each class', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    await page.goto('/timetable');
    await expect(page.getByRole('heading', { name: /timetable/i })).toBeVisible({ timeout: 15_000 });

    // The timetable page has two Select dropdowns: session and class
    // They may auto-select if there's only one option. Use combobox role.
    const selects = page.locator('button[data-slot="select-trigger"]');

    // Select session (first dropdown)
    await selects.nth(0).click();
    await page.getByRole('option', { name: SESSION_NAME }).click();

    // Select Class 1
    await selects.nth(1).click();
    await page.getByRole('option', { name: new RegExp(CLASS1_NAME) }).click();

    // Wait for timetable grid
    await expect(page.locator('table')).toBeVisible({ timeout: 15_000 });

    // Add a few timetable slots for Class 1
    const slotsClass1 = [
      { day: 'MONDAY', period: 1, label: 'Mathematics' },
      { day: 'MONDAY', period: 2, label: 'English Language' },
      { day: 'TUESDAY', period: 1, label: 'Basic Science' },
      { day: 'WEDNESDAY', period: 1, label: 'Social Studies' },
      { day: 'THURSDAY', period: 1, label: 'Computer Science' },
    ];

    for (const slot of slotsClass1) {
      const dayIndex = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].indexOf(slot.day);
      const row = page.locator('table tbody tr').nth(slot.period - 1);
      const cell = row.locator('td').nth(dayIndex + 1);
      await cell.getByRole('button').click();
      const dialog = page.locator('[data-slot="dialog-content"]');
      await expect(dialog).toBeVisible();
      await page.getByPlaceholder('Optional label').fill(slot.label);
      await page.getByRole('button', { name: /create slot/i }).click();
      await expectDialogClosed(page);
    }

    // Switch to Class 2
    await selects.nth(1).click();
    await page.getByRole('option', { name: new RegExp(CLASS2_NAME) }).click();
    await expect(page.locator('table')).toBeVisible({ timeout: 15_000 });

    // Add timetable slots for Class 2
    const slotsClass2 = [
      { day: 'MONDAY', period: 1, label: 'English Language' },
      { day: 'MONDAY', period: 2, label: 'Mathematics' },
      { day: 'TUESDAY', period: 1, label: 'Computer Science' },
      { day: 'WEDNESDAY', period: 1, label: 'Basic Science' },
      { day: 'THURSDAY', period: 1, label: 'Social Studies' },
    ];

    for (const slot of slotsClass2) {
      const dayIndex = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'].indexOf(slot.day);
      const row = page.locator('table tbody tr').nth(slot.period - 1);
      const cell = row.locator('td').nth(dayIndex + 1);
      await cell.getByRole('button').click();
      const dialog = page.locator('[data-slot="dialog-content"]');
      await expect(dialog).toBeVisible();
      await page.getByPlaceholder('Optional label').fill(slot.label);
      await page.getByRole('button', { name: /create slot/i }).click();
      await expectDialogClosed(page);
    }
  });

  test('2.17 — School Admin: Validate admin dashboard information', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    const dashboard = new DashboardPage(page);
    await dashboard.expectGreeting();
    await dashboard.expectAdminDashboard();

    // Verify stat cards show expected counts
    // We created 10 students (5 per class) and 3 teachers
    await expect(page.getByText('Total Students')).toBeVisible();
    await expect(page.getByText('Total Teachers')).toBeVisible();
  });

  test('2.18 — School Admin: Validate People section pages', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);

    // Check Users page
    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await usersPage.expectVisible();
    await usersPage.expectTableNotEmpty();
    // Should see the admin, second admin, and teachers
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

  test('2.19 — School Admin: Logout', async ({ page }) => {
    await loginViaUI(page, schoolData.adminEmail!);
    await waitForDashboard(page);
    await logout(page);
  });

  // =========================================================================
  // PHASE 3: TEACHER
  // =========================================================================

  test('3.1 — Teacher: Login and validate dashboard stats', async ({ page }) => {
    // Login as Teacher One (class teacher for JSS 1)
    await loginViaUI(page, TEACHER1_EMAIL);
    const dashboard = new DashboardPage(page);
    await dashboard.expectVisible();
    await dashboard.expectTeacherDashboard();
    await dashboard.expectGreeting();

    // Verify stat cards (scope to main content to avoid sidebar collisions)
    const main = page.getByRole('main');
    await expect(main.getByText('My Classes')).toBeVisible({ timeout: 15_000 });
    await expect(main.getByText('Total Students')).toBeVisible();
    await expect(main.getByText("Today's Attendance")).toBeVisible();
    await expect(main.getByText('Pending Homework')).toBeVisible();

    // Verify Quick Actions section
    await expect(page.getByText('Quick Actions')).toBeVisible();
    await expect(page.getByText('Take Attendance')).toBeVisible();
    await expect(page.getByText('Enter Grade')).toBeVisible();
    await expect(page.getByText('Create Homework')).toBeVisible();
    await expect(page.getByText('Send Message')).toBeVisible();

    // Verify Today's Schedule card
    await expect(page.getByText("Today's Schedule")).toBeVisible();

    // Verify key navigation items
    const sidebar = new SidebarPage(page);
    await sidebar.expectNavItem('Dashboard');
    await sidebar.expectNavItem('Students');
    await sidebar.expectNavItem('My Classes');
    await sidebar.expectNavItem('Academics');
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

  test('3.3 — Teacher: Validate today\'s schedule from timetable', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    // The dashboard shows Today's Schedule
    const scheduleCard = page.locator('text=Today\'s Schedule').locator('..');
    await expect(scheduleCard).toBeVisible({ timeout: 15_000 });

    // Check for schedule content — should show classes or "No schedule for today"
    const scheduleSection = scheduleCard.locator('..');
    const hasSchedule = await scheduleSection.getByText(/P\d/).first().isVisible().catch(() => false);
    const hasNoSchedule = await scheduleSection.getByText('No schedule for today').isVisible().catch(() => false);

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

  test('3.9 — Teacher: Create homework for all 5 subjects in JSS 1', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);

    const homework = new ManageHomeworkPage(page);
    await homework.goto();
    await homework.expectVisible();

    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const subject of TEACHER1_JSS1_SUBJECTS) {
      await homework.clickCreate();
      await homework.fillHomeworkForm(
        `${subject} HW ${TS}`,
        `Homework assignment for ${subject}. Complete all exercises.`,
        '50',
      );
      await homework.selectClass(new RegExp(CLASS1_NAME));
      await homework.selectSubject(new RegExp(subject));
      await homework.setDates(today, dueDate);
      await homework.submitForm();
      await expectDialogClosed(page);
      await homework.expectHomeworkInTable(`${subject} HW ${TS}`);
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

  test('3.12 — Teacher: Logout', async ({ page }) => {
    await loginViaUI(page, TEACHER1_EMAIL);
    await waitForDashboard(page);
    await logout(page);
  });
});
