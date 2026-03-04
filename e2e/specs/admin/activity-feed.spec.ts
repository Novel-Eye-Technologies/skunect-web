import { test, expect } from '../../fixtures/auth.fixture';
import { ActivityFeedPage } from '../../pages/activity-feed.page';

test.describe('Activity Feed', () => {
  test('admin can view activity feed page', async ({ adminPage }) => {
    const activityFeed = new ActivityFeedPage(adminPage);
    await activityFeed.goto();
    await activityFeed.expectVisible();
    await expect(activityFeed.description).toBeVisible();
  });

  test('activity feed shows recent activity section', async ({
    adminPage,
  }) => {
    const activityFeed = new ActivityFeedPage(adminPage);
    await activityFeed.goto();
    await activityFeed.expectVisible();
    await expect(activityFeed.activityList).toBeVisible();
  });
});
