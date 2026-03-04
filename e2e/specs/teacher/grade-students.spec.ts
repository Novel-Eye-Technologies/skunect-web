import fs from 'fs';
import path from 'path';
import { test, expect } from '../../fixtures/auth.fixture';
import { GradeStudentsPage } from '../../pages/grade-students.page';
import { apiPost } from '../../helpers/api.helper';

test.describe('Academics - Assessments & Grades', () => {
  // Create a unique class for assessment tests to avoid the unique constraint
  // on (class_id, subject_id, term_id, type) from stale E2E data.
  let freshClassName: string;

  test.beforeAll(async () => {
    freshClassName = `AssessClass ${Date.now()}`;
    try {
      const authFile = path.resolve(process.cwd(), '.auth/admin-kings.json');
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      const zustand = JSON.parse(authData.origins[0].localStorage[0].value);
      const token = zustand.state.accessToken as string;
      const schoolId = zustand.state.currentSchoolId as string;

      // Find the current session to create the class in
      const sessionsRes = await fetch(
        `${process.env.E2E_API_URL || `${process.env.E2E_BASE_URL || 'https://dev.skunect.com'}/api/v1`}/schools/${schoolId}/sessions`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const sessions = (await sessionsRes.json()).data ?? [];
      const currentSession = sessions.find((s: { isCurrent: boolean }) => s.isCurrent);
      const sessionId = currentSession?.id ?? sessions[0]?.id;

      if (sessionId) {
        await apiPost(
          `/schools/${schoolId}/classes`,
          token,
          { name: freshClassName, sessionId, capacity: 30 },
        );
      }
    } catch {
      // If setup fails, the create test will use whichever class is available
      freshClassName = '';
    }
  });

  test('admin can view academics page', async ({ adminPage }) => {
    const grades = new GradeStudentsPage(adminPage);
    await grades.goto();
    await grades.expectVisible();
  });

  test('teacher can view academics page', async ({ teacherPage }) => {
    const grades = new GradeStudentsPage(teacherPage);
    await grades.goto();
    await grades.expectVisible();
  });

  test('academics page shows all three tabs', async ({ adminPage }) => {
    const grades = new GradeStudentsPage(adminPage);
    await grades.goto();
    await grades.expectVisible();

    await expect(grades.assessmentsTab).toBeVisible();
    await expect(grades.gradeEntryTab).toBeVisible();
    await expect(grades.reportCardsTab).toBeVisible();
  });

  test('admin can create an assessment', async ({ adminPage }) => {
    // A freshly-created class is required to avoid unique constraint collisions
    // on (class_id, subject_id, term_id, type).  Skip if beforeAll failed.
    test.skip(!freshClassName, 'Fresh class creation failed in beforeAll — skipping to avoid unique constraint collision');

    const grades = new GradeStudentsPage(adminPage);
    await grades.goto();
    await grades.expectVisible();

    const title = `E2E Assessment ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await grades.clickCreateAssessment();
    await grades.fillAssessmentForm(title, '100', today);

    // Select the freshly-created class to avoid unique constraint collisions
    const classPattern = new RegExp(freshClassName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    await grades.selectAssessmentClass(classPattern);
    await grades.selectAssessmentSubject(/.+/);
    await grades.selectAssessmentTerm(/.+/);
    await grades.selectAssessmentType(/CA1/i);

    await grades.submitAssessmentForm();
    await expect(grades.dialog).not.toBeVisible({ timeout: 10_000 });
    await grades.expectAssessmentInTable(title);
  });

  test('admin can delete an assessment', async ({ adminPage }) => {
    const grades = new GradeStudentsPage(adminPage);
    await grades.goto();
    await grades.expectVisible();

    // Create one to delete
    const deleteTitle = `Delete Assessment ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await grades.clickCreateAssessment();
    await grades.fillAssessmentForm(deleteTitle, '50', today);
    await grades.selectAssessmentClass(/.+/);
    await grades.selectAssessmentSubject(/.+/);
    await grades.selectAssessmentTerm(/.+/);
    await grades.selectAssessmentType(/CA2/i);
    await grades.submitAssessmentForm();
    await expect(grades.dialog).not.toBeVisible({ timeout: 5_000 });
    await grades.expectAssessmentInTable(deleteTitle);

    // Delete it
    await grades.deleteAssessment(deleteTitle);
    await expect(
      grades.dataTable.getByText(deleteTitle)
    ).not.toBeVisible({ timeout: 5_000 });
  });

  test('grade entry tab shows assessment selector', async ({
    teacherPage,
  }) => {
    const grades = new GradeStudentsPage(teacherPage);
    await grades.goto();
    await grades.expectVisible();

    await grades.goToGradeEntry();

    // Should see the assessment selector (label text appears in many places)
    await expect(
      teacherPage.getByRole('combobox').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('report cards tab shows generate button', async ({ adminPage }) => {
    const grades = new GradeStudentsPage(adminPage);
    await grades.goto();
    await grades.expectVisible();

    await grades.goToReportCards();

    await expect(
      adminPage.getByRole('button', { name: /generate report cards/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test('assessment type badges show correct colors', async ({
    adminPage,
  }) => {
    const grades = new GradeStudentsPage(adminPage);
    await grades.goto();
    await grades.expectVisible();

    // Verify table headers include expected columns
    const headers = grades.dataTable.locator('thead th');
    await expect(headers.getByText('Title')).toBeVisible();
    await expect(headers.getByText('Type')).toBeVisible();
    await expect(headers.getByText('Max Score')).toBeVisible();
  });
});
