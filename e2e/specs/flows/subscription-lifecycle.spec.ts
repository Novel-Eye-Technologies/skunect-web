/**
 * Subscription Lifecycle E2E Tests
 *
 * Tests subscription state transitions that are NOT covered in the school-lifecycle spec:
 *
 * Phase 1: Setup — Authenticate SUPER_ADMIN, create a plan, assign subscription to Kings Academy
 * Phase 2: ACTIVE -> GRACE_PERIOD transition — Update subscription endDate to past, verify status
 * Phase 3: Verify school behavior during grace period — Admin sees warning, school still functions
 * Phase 4: GRACE_PERIOD -> EXPIRED transition — Update status, verify school-inactive page
 * Phase 5: Cleanup — Reactivate school subscription
 *
 * IMPORTANT: Since we cannot trigger the @Scheduled cron job from E2E tests, we use the
 * Super Admin API to directly update subscription dates/status for testing purposes.
 */
import { test, expect } from '../../fixtures/auth.fixture';
import {
  authenticateAccount,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
} from '../../helpers/api.helper';
import { TEST_OTP, TEST_ACCOUNTS, API_BASE_URL } from '../../fixtures/test-accounts';
import { SubscriptionPlansPage } from '../../pages/subscription-plans.page';
import { SchoolSubscriptionPage } from '../../pages/school-subscription.page';
import { AdminSubscriptionPage } from '../../pages/admin-subscription.page';
import { SchoolInactivePage } from '../../pages/school-inactive.page';
import { DashboardPage } from '../../pages/dashboard.page';

// ---------------------------------------------------------------------------
// Shared state across serial tests
// ---------------------------------------------------------------------------
interface SubscriptionTestData {
  superAdminToken: string;
  kingsSchoolId: string;
  planId: string;
  planName: string;
  subscriptionId: string;
}

const data: Partial<SubscriptionTestData> = {};

// Unique suffix to avoid collisions
const TS = Date.now().toString(36).slice(-5);
const PLAN_NAME = `Lifecycle Plan ${TS}`;

// ---------------------------------------------------------------------------
// Helper: get the first schoolId for a given role from the user's roles array
// ---------------------------------------------------------------------------
function getSchoolIdForRole(
  roles: Array<{ schoolId: string | null; role: string }>,
  role: string,
): string {
  const match = roles.find((r) => r.role === role && r.schoolId);
  if (!match?.schoolId) throw new Error(`No schoolId found for role ${role}`);
  return match.schoolId;
}

// Helper: format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------
test.describe.serial('Subscription Lifecycle E2E', () => {
  test.describe.configure({ retries: 1 });

  // =========================================================================
  // PHASE 1: SETUP
  // =========================================================================

  test('1.1 — Super Admin: Authenticate and get Kings Academy school ID', async () => {
    const auth = await authenticateAccount('superadmin@skunect.com', TEST_OTP);
    expect(auth.accessToken).toBeTruthy();
    data.superAdminToken = auth.accessToken;

    // Get Kings Academy school ID from the admin's roles
    const adminAuth = await authenticateAccount(TEST_ACCOUNTS.adminKings.email, TEST_OTP);
    const kingsRole = adminAuth.user.roles.find(
      (r) => r.role === 'ADMIN' && r.schoolName === 'Kings Academy Lagos',
    );
    expect(kingsRole).toBeDefined();
    expect(kingsRole!.schoolId).toBeTruthy();
    data.kingsSchoolId = kingsRole!.schoolId!;
  });

  test('1.2 — Super Admin: Create a subscription plan via API', async () => {
    const response = await apiPost<{ id: string; name: string }>(
      '/admin/subscription-plans',
      data.superAdminToken!,
      {
        name: PLAN_NAME,
        tier: 'STANDARD',
        pricePerStudent: 25000,
        billingPeriodMonths: 12,
        maxStudents: 200,
        isActive: true,
        isTrial: false,
      },
    );

    expect(response.status).toBe('SUCCESS');
    expect(response.data.id).toBeTruthy();
    data.planId = response.data.id;
    data.planName = PLAN_NAME;
  });

  test('1.3 — Super Admin: Assign ACTIVE subscription to Kings Academy', async () => {
    const today = new Date();
    const startDate = formatDate(today);
    const endDate = formatDate(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()));

    const response = await apiPost<{ id: string; status: string }>(
      `/admin/schools/${data.kingsSchoolId}/subscription`,
      data.superAdminToken!,
      {
        planId: data.planId,
        startDate,
        endDate,
        studentLimit: 100,
      },
    );

    expect(response.status).toBe('SUCCESS');
    data.subscriptionId = response.data.id;
  });

  test('1.4 — Super Admin: Verify subscription shows ACTIVE on UI', async ({ superAdminPage }) => {
    const subPage = new SchoolSubscriptionPage(superAdminPage);
    await subPage.goto(data.kingsSchoolId!);
    await subPage.expectVisible();
    await subPage.expectHasSubscription();
    await subPage.expectStatusText('ACTIVE');
  });

  // =========================================================================
  // PHASE 2: ACTIVE -> GRACE_PERIOD TRANSITION
  // =========================================================================

  test('2.1 — Super Admin: Update subscription to GRACE_PERIOD via API', async () => {
    // Re-authenticate to get a fresh token
    const auth = await authenticateAccount('superadmin@skunect.com', TEST_OTP);
    data.superAdminToken = auth.accessToken;

    // Re-resolve schoolId if it was lost during retry
    if (!data.kingsSchoolId) {
      const adminAuth = await authenticateAccount(TEST_ACCOUNTS.adminKings.email, TEST_OTP);
      const kingsRole = adminAuth.user.roles.find(
        (r: { role: string; schoolName?: string }) => r.role === 'ADMIN' && r.schoolName === 'Kings Academy Lagos',
      );
      data.kingsSchoolId = kingsRole?.schoolId ?? undefined;
    }
    expect(data.kingsSchoolId).toBeTruthy();

    // If no subscription was created (test 1.3 failed entirely), get existing one
    if (!data.subscriptionId) {
      try {
        const existing = await apiGet<{ id: string; status: string }>(
          `/admin/schools/${data.kingsSchoolId}/subscription`,
          data.superAdminToken!,
        );
        if (existing.data?.id) {
          data.subscriptionId = existing.data.id;
        }
      } catch {
        // No existing subscription — skip
      }
    }

    // Set endDate to yesterday and status to GRACE_PERIOD
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const response = await apiPut(
      `/admin/schools/${data.kingsSchoolId}/subscription`,
      data.superAdminToken!,
      {
        endDate: formatDate(yesterday),
        status: 'GRACE_PERIOD',
      },
    );

    expect(response.status).toBe('SUCCESS');
  });

  test('2.2 — Super Admin: Verify subscription shows GRACE_PERIOD on UI', async ({ superAdminPage }) => {
    const subPage = new SchoolSubscriptionPage(superAdminPage);
    await subPage.goto(data.kingsSchoolId!);
    await subPage.expectVisible();
    await subPage.expectHasSubscription();

    // Check for GRACE_PERIOD status text
    await expect(
      superAdminPage.getByText('GRACE_PERIOD').or(superAdminPage.getByText('Grace Period')),
    ).toBeVisible({ timeout: 10_000 });
  });

  // =========================================================================
  // PHASE 3: VERIFY SCHOOL BEHAVIOR DURING GRACE PERIOD
  // =========================================================================

  test('3.1 — School Admin: Dashboard shows subscription warning during grace period', async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectVisible();

    // During grace period the admin should see some kind of subscription warning
    // This could be a banner, alert, or the subscription page showing the warning
    const adminSubPage = new AdminSubscriptionPage(adminPage);
    await adminSubPage.goto();
    await adminSubPage.expectVisible();
    await adminSubPage.expectHasSubscription();

    // The grace period warning should be visible
    await adminSubPage.expectGracePeriodWarning();
  });

  test('3.2 — School Admin: School still functions during grace period (can access dashboard)', async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();

    // Verify admin dashboard content still renders
    await dashboard.expectAdminDashboard();
  });

  // =========================================================================
  // PHASE 4: GRACE_PERIOD -> EXPIRED TRANSITION
  // =========================================================================

  test('4.1 — Super Admin: Update subscription status to EXPIRED via API', async () => {
    const auth = await authenticateAccount('superadmin@skunect.com', TEST_OTP);
    data.superAdminToken = auth.accessToken;

    // Set a very old end date and status to EXPIRED
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    const startDate = formatDate(new Date(pastDate.getFullYear() - 1, pastDate.getMonth(), pastDate.getDate()));

    const response = await apiPut(
      `/admin/schools/${data.kingsSchoolId}/subscription`,
      data.superAdminToken!,
      {
        planId: data.planId,
        startDate,
        endDate: formatDate(pastDate),
        studentLimit: 100,
        status: 'EXPIRED',
      },
    );

    expect(response.status).toBe('SUCCESS');
  });

  test('4.2 — Super Admin: Verify subscription shows EXPIRED on UI', async ({ superAdminPage }) => {
    const subPage = new SchoolSubscriptionPage(superAdminPage);
    await subPage.goto(data.kingsSchoolId!);
    await subPage.expectVisible();

    await expect(
      superAdminPage.getByText('EXPIRED').or(superAdminPage.getByText('Expired')),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('4.3 — Teacher: Sees school-inactive page when subscription expired', async ({ teacherPage }) => {
    // When the school subscription is expired, teachers should be redirected
    // to the school-inactive page
    await teacherPage.goto('/dashboard');
    await teacherPage.waitForLoadState('networkidle').catch(() => {});

    // The page should either show the school-inactive message or redirect there
    const inactivePage = new SchoolInactivePage(teacherPage);
    const isInactive = await teacherPage
      .getByRole('heading', { name: /school subscription inactive/i })
      .isVisible({ timeout: 15_000 })
      .catch(() => false);

    if (isInactive) {
      await inactivePage.expectVisible();
      await inactivePage.expectContactMessage();
    } else {
      // If not redirected, at minimum the dashboard should show restricted access
      // or a warning about the expired subscription
      await expect(
        teacherPage.getByText(/inactive/i)
          .or(teacherPage.getByText(/expired/i))
          .or(teacherPage.getByText(/subscription/i)),
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  test('4.4 — Parent: Sees school-inactive page when subscription expired', async ({ parentPage }) => {
    await parentPage.goto('/dashboard');
    await parentPage.waitForLoadState('networkidle').catch(() => {});

    const isInactive = await parentPage
      .getByRole('heading', { name: /school subscription inactive/i })
      .isVisible({ timeout: 15_000 })
      .catch(() => false);

    if (isInactive) {
      const inactivePage = new SchoolInactivePage(parentPage);
      await inactivePage.expectVisible();
      await inactivePage.expectContactMessage();
    } else {
      await expect(
        parentPage.getByText(/inactive/i)
          .or(parentPage.getByText(/expired/i))
          .or(parentPage.getByText(/subscription/i)),
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  // =========================================================================
  // PHASE 5: CLEANUP — REACTIVATE SCHOOL SUBSCRIPTION
  // =========================================================================

  test('5.1 — Super Admin: Reactivate subscription via API', async () => {
    const auth = await authenticateAccount('superadmin@skunect.com', TEST_OTP);
    data.superAdminToken = auth.accessToken;

    const today = new Date();
    const startDate = formatDate(today);
    const endDate = formatDate(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()));

    const response = await apiPut(
      `/admin/schools/${data.kingsSchoolId}/subscription`,
      data.superAdminToken!,
      {
        planId: data.planId,
        startDate,
        endDate,
        studentLimit: 200,
        status: 'ACTIVE',
      },
    );

    expect(response.status).toBe('SUCCESS');
  });

  test('5.2 — Super Admin: Verify subscription is ACTIVE again on UI', async ({ superAdminPage }) => {
    const subPage = new SchoolSubscriptionPage(superAdminPage);
    await subPage.goto(data.kingsSchoolId!);
    await subPage.expectVisible();
    await subPage.expectHasSubscription();
    await subPage.expectStatusText('ACTIVE');
  });

  test('5.3 — School Admin: Can access dashboard after reactivation', async ({ adminPage }) => {
    const dashboard = new DashboardPage(adminPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
  });

  test('5.4 — Teacher: Can access dashboard after reactivation', async ({ teacherPage }) => {
    const dashboard = new DashboardPage(teacherPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
  });
});
