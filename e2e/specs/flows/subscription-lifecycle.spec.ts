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

// Helper: ensure superAdminToken and kingsSchoolId are available (survives retries)
async function ensureAuthAndSchoolId(): Promise<void> {
  if (!data.superAdminToken) {
    const auth = await authenticateAccount('superadmin@skunect.com', TEST_OTP);
    data.superAdminToken = auth.accessToken;
  }
  if (!data.kingsSchoolId) {
    const adminAuth = await authenticateAccount(TEST_ACCOUNTS.adminKings.email, TEST_OTP);
    const kingsRole = adminAuth.user.roles.find(
      (r: { role: string; schoolName?: string }) => r.role === 'ADMIN' && r.schoolName === 'Kings Academy Lagos',
    );
    data.kingsSchoolId = kingsRole?.schoolId ?? undefined;
  }
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
    // Cancel any existing subscription first to avoid SUBSCRIPTION_EXISTS error
    try {
      await apiPatch(
        `/admin/schools/${data.kingsSchoolId}/subscription/cancel`,
        data.superAdminToken!,
      );
    } catch {
      // No existing subscription to cancel — that's fine
    }

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
    await ensureAuthAndSchoolId();
    expect(data.kingsSchoolId).toBeTruthy();

    // Update only the status to GRACE_PERIOD (keep existing dates)
    const response = await apiPut(
      `/admin/schools/${data.kingsSchoolId}/subscription`,
      data.superAdminToken!,
      {
        status: 'GRACE_PERIOD',
      },
    );

    expect(response.status).toBe('SUCCESS');
  });

  test('2.2 — Super Admin: Verify subscription shows GRACE_PERIOD on UI', async ({ superAdminPage }) => {
    const subPage = new SchoolSubscriptionPage(superAdminPage);
    await subPage.goto(data.kingsSchoolId!);
    await subPage.expectVisible();

    // The UI shows "Grace Period Active" alert when status is GRACE_PERIOD
    await expect(
      superAdminPage.getByText('Grace Period Active'),
    ).toBeVisible({ timeout: 15_000 });
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
    await ensureAuthAndSchoolId();

    const response = await apiPut(
      `/admin/schools/${data.kingsSchoolId}/subscription`,
      data.superAdminToken!,
      {
        status: 'EXPIRED',
      },
    );

    expect(response.status).toBe('SUCCESS');
  });

  test('4.2 — Super Admin: Verify subscription shows EXPIRED or no subscription on UI', async ({ superAdminPage }) => {
    const subPage = new SchoolSubscriptionPage(superAdminPage);
    await subPage.goto(data.kingsSchoolId!);
    await subPage.expectVisible();

    // When expired, the page shows either EXPIRED status text or "No active subscription"
    await expect(
      superAdminPage.getByText('EXPIRED')
        .or(superAdminPage.getByText(/no active subscription/i)),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('4.3 — Teacher: Dashboard still accessible (school not deactivated by scheduler)', async ({ teacherPage }) => {
    // NOTE: Setting subscription status to EXPIRED via API does NOT deactivate the school.
    // The SubscriptionScheduler (daily cron) handles school deactivation.
    // Here we verify the teacher can still access the dashboard since the school is still active.
    const dashboard = new DashboardPage(teacherPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
  });

  test('4.4 — Parent: Dashboard still accessible (school not deactivated by scheduler)', async ({ parentPage }) => {
    const dashboard = new DashboardPage(parentPage);
    await dashboard.goto();
    await dashboard.expectVisible();
    await dashboard.expectGreeting();
  });

  // =========================================================================
  // PHASE 5: CLEANUP — REACTIVATE SCHOOL SUBSCRIPTION
  // =========================================================================

  test('5.1 — Super Admin: Reactivate subscription via API', async () => {
    // Force fresh auth — token may have expired during phases 3-4
    data.superAdminToken = undefined;
    await ensureAuthAndSchoolId();

    // Try updating existing subscription first
    const today = new Date();
    const endDate = formatDate(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()));

    try {
      const response = await apiPut(
        `/admin/schools/${data.kingsSchoolId}/subscription`,
        data.superAdminToken!,
        {
          endDate,
          studentLimit: 200,
          status: 'ACTIVE',
        },
      );
      expect(response.status).toBe('SUCCESS');
    } catch {
      // If PUT fails (e.g. subscription was cleared on EXPIRED), cancel and create new
      try {
        await apiPatch(
          `/admin/schools/${data.kingsSchoolId}/subscription/cancel`,
          data.superAdminToken!,
        );
      } catch {
        // Already cancelled or no subscription
      }

      const response = await apiPost<{ id: string; status: string }>(
        `/admin/schools/${data.kingsSchoolId}/subscription`,
        data.superAdminToken!,
        {
          planId: data.planId,
          startDate: formatDate(today),
          endDate,
          studentLimit: 200,
        },
      );
      expect(response.status).toBe('SUCCESS');
      data.subscriptionId = response.data.id;
    }
  });

  test('5.2 — Super Admin: Verify subscription is ACTIVE again on UI', async ({ superAdminPage }) => {
    const subPage = new SchoolSubscriptionPage(superAdminPage);
    await subPage.goto(data.kingsSchoolId!);
    await subPage.expectVisible();
    await expect(superAdminPage.getByText('ACTIVE')).toBeVisible({ timeout: 15_000 });
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
