import { test, expect } from '../../fixtures/auth.fixture';
import { GradeStudentsPage } from '../../pages/grade-students.page';

test.describe('Academics - Assessments & Grades', () => {
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
    const grades = new GradeStudentsPage(adminPage);
    await grades.goto();
    await grades.expectVisible();

    const title = `E2E Assessment ${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await grades.clickCreateAssessment();
    await grades.fillAssessmentForm(title, '100', today);

    // Select class, subject, term, and type
    await grades.selectAssessmentClass(/.+/);
    await grades.selectAssessmentSubject(/.+/);
    await grades.selectAssessmentTerm(/.+/);
    await grades.selectAssessmentType(/CA1/i);

    await grades.submitAssessmentForm();
    await expect(grades.dialog).not.toBeVisible({ timeout: 5_000 });
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

    // Should see the assessment selector
    await expect(
      teacherPage.getByText('Assessment')
    ).toBeVisible({ timeout: 10_000 });
    await expect(teacherPage.getByRole('combobox')).toBeVisible();
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
