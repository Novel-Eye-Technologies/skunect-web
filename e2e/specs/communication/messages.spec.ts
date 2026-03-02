import { test, expect } from '../../fixtures/auth.fixture';
import { MessagesPage } from '../../pages/communication.page';

test.describe('Messages', () => {
  test('admin can view messages page', async ({ adminPage }) => {
    const messages = new MessagesPage(adminPage);
    await messages.goto();
    await messages.expectVisible();
    await expect(messages.description).toBeVisible();
  });

  test('teacher can view messages page', async ({ teacherPage }) => {
    const messages = new MessagesPage(teacherPage);
    await messages.goto();
    await messages.expectVisible();
  });

  test('parent can view messages page', async ({ parentPage }) => {
    const messages = new MessagesPage(parentPage);
    await messages.goto();
    await messages.expectVisible();
  });
});
