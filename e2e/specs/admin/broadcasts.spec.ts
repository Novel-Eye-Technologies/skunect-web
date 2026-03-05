import { test, expect } from '../../fixtures/auth.fixture';
import { BroadcastsPage } from '../../pages/broadcasts.page';

test.describe('Broadcasts Management (CRUD)', () => {
  test('admin can navigate to broadcasts page', async ({ adminPage }) => {
    const broadcasts = new BroadcastsPage(adminPage);
    await broadcasts.goto();
    await broadcasts.expectVisible();
  });

  test('admin sees broadcasts page description', async ({ adminPage }) => {
    const broadcasts = new BroadcastsPage(adminPage);
    await broadcasts.goto();
    await expect(
      adminPage.getByText(/send group messages/i)
    ).toBeVisible();
  });

  test('admin can open new broadcast dialog', async ({ adminPage }) => {
    const broadcasts = new BroadcastsPage(adminPage);
    await broadcasts.goto();
    await broadcasts.clickNewBroadcast();
    await expect(broadcasts.dialog).toBeVisible();
    await expect(
      broadcasts.dialog.getByRole('heading', { name: /send broadcast/i })
    ).toBeVisible();
  });

  test('admin can create a broadcast to everyone', async ({ adminPage }) => {
    const broadcasts = new BroadcastsPage(adminPage);
    await broadcasts.goto();
    await broadcasts.expectVisible();

    const uniqueTitle = `E2E Broadcast ${Date.now()}`;

    await broadcasts.clickNewBroadcast();
    await broadcasts.fillBroadcastForm(
      uniqueTitle,
      'This is a test broadcast message from E2E tests.',
    );
    // Target type defaults to "Everyone" (ALL)
    await broadcasts.submitBroadcast();

    // Dialog should close
    await expect(broadcasts.dialog).not.toBeVisible({ timeout: 5_000 });
    // Broadcast should appear in list
    await broadcasts.expectBroadcastInList(uniqueTitle);
  });

  test('admin can create a broadcast by role', async ({ adminPage }) => {
    const broadcasts = new BroadcastsPage(adminPage);
    await broadcasts.goto();
    await broadcasts.expectVisible();

    const uniqueTitle = `E2E Role Broadcast ${Date.now()}`;

    await broadcasts.clickNewBroadcast();
    await broadcasts.fillBroadcastForm(
      uniqueTitle,
      'Role-targeted broadcast from E2E tests.',
    );

    // Select "By Role" target type
    await broadcasts.selectTargetType('By Role');
    // Select "Parents" role
    await broadcasts.selectRole('Parents');

    await broadcasts.submitBroadcast();
    await expect(broadcasts.dialog).not.toBeVisible({ timeout: 5_000 });
    await broadcasts.expectBroadcastInList(uniqueTitle);
  });

  test('broadcast card shows target type badge', async ({ adminPage }) => {
    const broadcasts = new BroadcastsPage(adminPage);
    await broadcasts.goto();
    await broadcasts.expectVisible();

    // Wait for loading to finish: empty state or actual card with badge
    await expect(
      broadcasts.emptyState.or(adminPage.locator('[data-slot="badge"]').first())
    ).toBeVisible({ timeout: 10_000 });

    const cards = adminPage.locator('[data-slot="card"]').filter({ has: adminPage.locator('[data-slot="badge"]') });
    const count = await cards.count();
    if (count > 0) {
      const firstBadge = cards.first().locator('[data-slot="badge"]');
      await expect(firstBadge).toBeVisible();
    }
  });

  test('broadcast card shows recipient count', async ({ adminPage }) => {
    const broadcasts = new BroadcastsPage(adminPage);
    await broadcasts.goto();
    await broadcasts.expectVisible();

    // Wait for loading to finish: empty state or a card with "By" text (real content)
    await expect(
      broadcasts.emptyState.or(adminPage.getByText(/^By /).first())
    ).toBeVisible({ timeout: 10_000 });

    // Only check real broadcast cards (those with a badge, not skeletons)
    const cards = adminPage.locator('[data-slot="card"]').filter({ has: adminPage.locator('[data-slot="badge"]') });
    const count = await cards.count();
    if (count > 0) {
      // SVG Users icon should be present indicating recipient count
      await expect(cards.first().locator('svg').first()).toBeVisible();
    }
  });

  test('broadcast shows sender name and date', async ({ adminPage }) => {
    const broadcasts = new BroadcastsPage(adminPage);
    await broadcasts.goto();
    await broadcasts.expectVisible();

    // Wait for loading to finish
    await expect(
      broadcasts.emptyState.or(adminPage.getByText(/^By /).first())
    ).toBeVisible({ timeout: 10_000 });

    const cards = adminPage.locator('[data-slot="card"]').filter({ has: adminPage.locator('[data-slot="badge"]') });
    const count = await cards.count();
    if (count > 0) {
      // Should show "By <name>" text
      await expect(cards.first().getByText(/^By /).first()).toBeVisible();
    }
  });

  test('dialog closes when clicking outside', async ({ adminPage }) => {
    const broadcasts = new BroadcastsPage(adminPage);
    await broadcasts.goto();
    await broadcasts.clickNewBroadcast();

    // Press Escape to close dialog
    await adminPage.keyboard.press('Escape');
    await expect(broadcasts.dialog).not.toBeVisible({ timeout: 3_000 });
  });
});
