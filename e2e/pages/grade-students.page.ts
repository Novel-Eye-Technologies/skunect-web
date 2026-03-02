import { type Page, type Locator, expect } from '@playwright/test';

export class GradeStudentsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly assessmentsTab: Locator;
  readonly gradeEntryTab: Locator;
  readonly reportCardsTab: Locator;
  readonly dataTable: Locator;
  readonly dialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /academics/i });
    this.description = page.getByText(
      'Manage assessments, grades, and report cards.'
    );
    this.assessmentsTab = page.getByRole('tab', { name: /assessments/i });
    this.gradeEntryTab = page.getByRole('tab', { name: /grade entry/i });
    this.reportCardsTab = page.getByRole('tab', { name: /report cards/i });
    this.dataTable = page.locator('table');
    this.dialog = page.getByRole('dialog');
  }

  async goto() {
    await this.page.goto('/academics');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  // --- Assessments tab ---

  async clickCreateAssessment() {
    await this.assessmentsTab.click();
    const createBtn = this.page.getByRole('button', {
      name: /create assessment/i,
    });
    await createBtn.click();
    await expect(this.dialog).toBeVisible();
  }

  async fillAssessmentForm(
    title: string,
    maxScore?: string,
    date?: string
  ) {
    await this.page.getByPlaceholder('e.g. Mathematics CA1').fill(title);
    if (maxScore) {
      await this.dialog.locator('input[type="number"]').fill(maxScore);
    }
    if (date) {
      await this.dialog.locator('input[type="date"]').fill(date);
    }
  }

  async selectAssessmentClass(className: string) {
    const selects = this.dialog.getByRole('combobox');
    await selects.first().click();
    await this.page.getByRole('option', { name: className }).click();
  }

  async selectAssessmentSubject(subjectName: string) {
    const selects = this.dialog.getByRole('combobox');
    await selects.nth(1).click();
    await this.page.getByRole('option', { name: subjectName }).click();
  }

  async selectAssessmentTerm(termName: string) {
    const selects = this.dialog.getByRole('combobox');
    await selects.nth(2).click();
    await this.page.getByRole('option', { name: termName }).click();
  }

  async selectAssessmentType(type: string) {
    const selects = this.dialog.getByRole('combobox');
    await selects.nth(3).click();
    await this.page.getByRole('option', { name: type }).click();
  }

  async submitAssessmentForm() {
    const submitButton = this.dialog.getByRole('button', {
      name: /create assessment|save changes/i,
    });
    await submitButton.click();
  }

  async expectAssessmentInTable(title: string) {
    await expect(this.dataTable.getByText(title)).toBeVisible({
      timeout: 10_000,
    });
  }

  async deleteAssessment(title: string) {
    const row = this.dataTable.locator('tr', { hasText: title });
    await row.getByRole('button').last().click();
    await this.page.getByRole('menuitem', { name: /delete/i }).click();
    const confirmButton = this.page.getByRole('button', { name: /delete/i });
    await confirmButton.click();
  }

  // --- Grade Entry tab ---

  async goToGradeEntry() {
    await this.gradeEntryTab.click();
  }

  async selectAssessmentForGrading(assessmentLabel: string) {
    const select = this.page.getByRole('combobox');
    await select.click();
    await this.page
      .getByRole('option', { name: new RegExp(assessmentLabel, 'i') })
      .click();
  }

  async enterScore(rowIndex: number, score: string) {
    const scoreInputs = this.page.locator(
      'table tbody tr input[type="number"]'
    );
    await scoreInputs.nth(rowIndex).fill(score);
  }

  async submitScores() {
    const submitBtn = this.page.getByRole('button', {
      name: /submit scores/i,
    });
    await submitBtn.click();
  }

  // --- Report Cards tab ---

  async goToReportCards() {
    await this.reportCardsTab.click();
  }

  async clickGenerateReportCards() {
    const generateBtn = this.page.getByRole('button', {
      name: /generate report cards/i,
    });
    await generateBtn.click();
    await expect(this.dialog).toBeVisible();
  }

  async expectReportCardTableNotEmpty() {
    const rows = this.dataTable.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  }
}
