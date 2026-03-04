import { test, expect } from '../../fixtures/auth.fixture';
import { HelpPage } from '../../pages/help.page';

test.describe('Help & Support', () => {
  test('admin can view help page', async ({ adminPage }) => {
    const help = new HelpPage(adminPage);
    await help.goto();
    await help.expectVisible();
    await expect(help.description).toBeVisible();
  });

  test('help page shows FAQ sections', async ({ adminPage }) => {
    const help = new HelpPage(adminPage);
    await help.goto();
    await help.expectVisible();
    await help.expectFaqSections();
  });

  test('teacher can view help page', async ({ teacherPage }) => {
    const help = new HelpPage(teacherPage);
    await help.goto();
    await help.expectVisible();
  });

  test('parent can view help page', async ({ parentPage }) => {
    const help = new HelpPage(parentPage);
    await help.goto();
    await help.expectVisible();
  });

  test('super admin can view help page', async ({ superAdminPage }) => {
    const help = new HelpPage(superAdminPage);
    await help.goto();
    await help.expectVisible();
  });
});
