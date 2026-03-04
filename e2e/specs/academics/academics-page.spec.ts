import { test, expect } from '../../fixtures/auth.fixture';
import { AcademicsPage } from '../../pages/academics.page';

test.describe('Academics Page', () => {
  test('admin can view academics page', async ({ adminPage }) => {
    const academics = new AcademicsPage(adminPage);
    await academics.goto();
    await academics.expectVisible();
    await expect(academics.description).toBeVisible();
  });

  test('academics page shows all three tabs', async ({ adminPage }) => {
    const academics = new AcademicsPage(adminPage);
    await academics.goto();
    await academics.expectVisible();
    await expect(academics.assessmentsTab).toBeVisible();
    await expect(academics.gradeEntryTab).toBeVisible();
    await expect(academics.reportCardsTab).toBeVisible();
  });

  test('admin sees Create Assessment button', async ({ adminPage }) => {
    const academics = new AcademicsPage(adminPage);
    await academics.goto();
    await academics.expectVisible();
    await expect(academics.createAssessmentButton).toBeVisible();
  });

  test('teacher can view academics page', async ({ teacherPage }) => {
    const academics = new AcademicsPage(teacherPage);
    await academics.goto();
    await academics.expectVisible();
  });
});
