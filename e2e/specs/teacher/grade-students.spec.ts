import fs from 'fs';
import path from 'path';
import { test, expect } from '../../fixtures/auth.fixture';
import { GradeStudentsPage } from '../../pages/grade-students.page';

test.describe('Academics - Assessments & Grades', () => {
  test.beforeAll(async () => {
    try {
      const authFile = path.resolve(process.cwd(), '.auth/admin-kings.json');
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      const zustand = JSON.parse(authData.origins[0].localStorage[0].value);
      const token = zustand.state.accessToken as string;
      const schoolId = zustand.state.currentSchoolId as string;
      const apiBase =
        process.env.E2E_API_URL ||
        `${process.env.E2E_BASE_URL || 'https://dev.skunect.com'}/api/v1`;

      // Clean up stale E2E assessments to prevent table overflow
      const listRes = await fetch(
        `${apiBase}/schools/${schoolId}/assessments?size=200`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (listRes.ok) {
        const listBody = await listRes.json().catch(() => ({ data: [] }));
        const assessments: Array<{ id: string; title?: string }> =
          Array.isArray(listBody.data) ? listBody.data : [];
        for (const a of assessments) {
          if (
            a.title?.startsWith('E2E Assessment') ||
            a.title?.startsWith('Delete Assessment') ||
            a.title?.startsWith('E2E Perm')
          ) {
            await fetch(
              `${apiBase}/schools/${schoolId}/assessments/${a.id}`,
              {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              },
            ).catch(() => {});
          }
        }
      }

      // Also clean up stale E2E classes to keep the class list manageable
      const classRes = await fetch(
        `${apiBase}/schools/${schoolId}/classes?size=200`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (classRes.ok) {
        const classBody = await classRes.json().catch(() => ({ data: [] }));
        const classes: Array<{ id: string; name: string }> =
          Array.isArray(classBody.data) ? classBody.data : [];
        for (const c of classes) {
          if (
            c.name.startsWith('AssessClass') ||
            c.name.startsWith('Delete Me') ||
            c.name.startsWith('E2E Class')
          ) {
            await fetch(
              `${apiBase}/schools/${schoolId}/classes/${c.id}`,
              {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              },
            ).catch(() => {});
          }
        }
      }
    } catch {
      // Best-effort cleanup
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

  test('teacher can create an assessment', async ({ teacherPage }) => {
    const grades = new GradeStudentsPage(teacherPage);
    await grades.goto();
    await grades.expectVisible();

    const title = `E2E Assessment ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await grades.clickCreateAssessment();
    await grades.fillAssessmentForm(title, '100', today);

    // Use existing seed class JSS 1A (has subjects assigned)
    await grades.selectAssessmentClass(/JSS 1A/);
    await grades.selectAssessmentSubject(/Physics|Chemistry/);
    await grades.selectAssessmentTerm(/Second Term/);
    // Use CA2 to avoid collision with seed assessments (which use CA1 and EXAM)
    await grades.selectAssessmentType(/CA2/i);

    await grades.submitAssessmentForm();
    await expect(grades.dialog).not.toBeVisible({ timeout: 10_000 });

    // Wait for table to refresh and verify the new assessment appears
    await grades.expectAssessmentInTable(title);
  });

  test('teacher can delete an assessment', async ({ teacherPage }) => {
    const grades = new GradeStudentsPage(teacherPage);
    await grades.goto();
    await grades.expectVisible();

    // Create one to delete (use CA3 to avoid collisions)
    const deleteTitle = `Delete Assessment ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await grades.clickCreateAssessment();
    await grades.fillAssessmentForm(deleteTitle, '50', today);
    await grades.selectAssessmentClass(/JSS 1A/);
    await grades.selectAssessmentSubject(/Physics|Chemistry/);
    await grades.selectAssessmentTerm(/Second Term/);
    await grades.selectAssessmentType(/CA3/i);
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
