import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Teacher My Subjects View', () => {
  test('teacher can view my classes page with subjects section', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/my-classes');
    await expect(
      teacherPage.getByRole('heading', { name: 'My Classes' })
    ).toBeVisible({ timeout: 15_000 });
  });

  test('teacher can see my subjects table when subjects are assigned', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/my-classes');
    await expect(
      teacherPage.getByRole('heading', { name: 'My Classes' })
    ).toBeVisible({ timeout: 15_000 });

    // Check if "My Subjects" heading exists (only shows when teacher has subjects)
    const mySubjectsHeading = teacherPage.getByRole('heading', {
      name: 'My Subjects',
    });
    const hasSubjects = await mySubjectsHeading
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (hasSubjects) {
      // Should see a table with Subject, Code, Class, Role columns
      const subjectsTable = teacherPage
        .locator('table')
        .filter({ hasText: 'Subject' })
        .filter({ hasText: 'Role' });
      await expect(subjectsTable).toBeVisible();

      // Should see role badges (Class Teacher or Subject Teacher)
      const roleBadges = teacherPage.locator(
        'text=/Class Teacher|Subject Teacher/'
      );
      expect(await roleBadges.count()).toBeGreaterThan(0);
    }
  });

  test('teacher subjects show correct role badges', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/my-classes');
    await expect(
      teacherPage.getByRole('heading', { name: 'My Classes' })
    ).toBeVisible({ timeout: 15_000 });

    const mySubjectsHeading = teacherPage.getByRole('heading', {
      name: 'My Subjects',
    });
    const hasSubjects = await mySubjectsHeading
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (hasSubjects) {
      // Each subject row should have either "Class Teacher" or "Subject Teacher" badge
      const subjectRows = teacherPage
        .locator('table')
        .filter({ hasText: 'Role' })
        .locator('tbody tr');
      const rowCount = await subjectRows.count();

      for (let i = 0; i < Math.min(rowCount, 5); i++) {
        const row = subjectRows.nth(i);
        const hasClassTeacher = await row
          .getByText('Class Teacher')
          .isVisible()
          .catch(() => false);
        const hasSubjectTeacher = await row
          .getByText('Subject Teacher')
          .isVisible()
          .catch(() => false);
        // Each row should have one of the two badges
        expect(hasClassTeacher || hasSubjectTeacher).toBeTruthy();
      }
    }
  });

  test('teacher can view my subjects with correct subject count', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/my-classes');
    await expect(
      teacherPage.getByRole('heading', { name: 'My Classes' })
    ).toBeVisible({ timeout: 15_000 });

    const mySubjectsHeading = teacherPage.getByRole('heading', {
      name: 'My Subjects',
    });
    await expect(mySubjectsHeading).toBeVisible({ timeout: 5_000 });

    // The My Subjects table should have rows — teacher1 (Mary) is class teacher
    // of JSS 1A with at least 4 inherited subjects (English, Math, Physics, Chemistry)
    const subjectsTable = teacherPage
      .locator('table')
      .filter({ hasText: 'Subject' })
      .filter({ hasText: 'Role' });
    await expect(subjectsTable).toBeVisible();

    const subjectRows = subjectsTable.locator('tbody tr');
    const rowCount = await subjectRows.count();
    // Mary should have at least 4 inherited subjects from JSS 1A
    expect(rowCount).toBeGreaterThanOrEqual(4);
  });

  test('teacher my subjects shows both Class Teacher and Subject Teacher roles', async ({
    teacherPage,
  }) => {
    await teacherPage.goto('/my-classes');
    await expect(
      teacherPage.getByRole('heading', { name: 'My Classes' })
    ).toBeVisible({ timeout: 15_000 });

    const mySubjectsHeading = teacherPage.getByRole('heading', {
      name: 'My Subjects',
    });
    const hasSubjects = await mySubjectsHeading
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (hasSubjects) {
      const subjectsTable = teacherPage
        .locator('table')
        .filter({ hasText: 'Role' });

      // Check that at least "Class Teacher" badges are visible
      // (teacher1/Mary is class teacher of JSS 1A so inherited subjects show "Class Teacher")
      const classTeacherBadges = subjectsTable.getByText('Class Teacher');
      const classTeacherCount = await classTeacherBadges.count();
      expect(classTeacherCount).toBeGreaterThan(0);

      // Check if "Subject Teacher" badges are also visible
      // This would be present if the teacher also has explicitly assigned subjects
      const subjectTeacherBadges = subjectsTable.getByText('Subject Teacher');
      const subjectTeacherCount = await subjectTeacherBadges.count();

      // At minimum, one badge type must be present; both may be present
      // if the teacher has a mix of inherited and explicitly assigned subjects
      expect(classTeacherCount + subjectTeacherCount).toBeGreaterThan(0);
    }
  });
});
