/**
 * Custom Playwright test fixtures that provide pre-authenticated pages
 * for each role. Tests import `test` from this file instead of '@playwright/test'.
 *
 * Usage:
 *   import { test, expect } from '../../fixtures/auth.fixture';
 *
 *   test('admin can view students', async ({ adminPage }) => {
 *     await adminPage.goto('/students');
 *     await expect(adminPage.locator('h1')).toContainText('Students');
 *   });
 */
import { test as base, type Page } from '@playwright/test';
import { TEST_ACCOUNTS } from './test-accounts';

type AuthFixtures = {
  /** Pre-authenticated page for ADMIN @ Kings Academy */
  adminPage: Page;
  /** Pre-authenticated page for ADMIN @ Greenfield */
  adminGreenfieldPage: Page;
  /** Pre-authenticated page for TEACHER @ Kings Academy */
  teacherPage: Page;
  /** Pre-authenticated page for TEACHER @ Greenfield */
  teacherGreenfieldPage: Page;
  /** Pre-authenticated page for PARENT (single school, Kings) */
  parentPage: Page;
  /** Pre-authenticated page for PARENT (cross-school) */
  parentCrossPage: Page;
  /** Pre-authenticated page for PARENT @ Greenfield */
  parentGreenfieldPage: Page;
  /** Pre-authenticated page for SUPER_ADMIN */
  superAdminPage: Page;
  /** Pre-authenticated page for TEACHER+PARENT dual role */
  teacherParentPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.adminKings.storageStatePath,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  adminGreenfieldPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.adminGreenfield.storageStatePath,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  teacherPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.teacherKings.storageStatePath,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  teacherGreenfieldPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.teacherGreenfield.storageStatePath,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  parentPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.parentSingle.storageStatePath,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  parentCrossPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.parentCross.storageStatePath,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  parentGreenfieldPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.parentGreenfield.storageStatePath,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  superAdminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.superAdmin.storageStatePath,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  teacherParentPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: TEST_ACCOUNTS.teacherParent.storageStatePath,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
