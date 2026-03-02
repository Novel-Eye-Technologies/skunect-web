import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { VerifyOtpPage } from '../../pages/verify-otp.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { TEST_ACCOUNTS } from '../../fixtures/test-accounts';

test.describe('Email Login Flow', () => {
  let loginPage: LoginPage;
  let otpPage: VerifyOtpPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    otpPage = new VerifyOtpPage(page);
    await loginPage.goto();
  });

  test('login page loads correctly', async () => {
    await loginPage.expectVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
  });

  test('admin can login with email and OTP', async ({ page }) => {
    await loginPage.loginWithEmail(TEST_ACCOUNTS.adminKings.email);

    // Should navigate to /verify-otp with a ref query param
    await expect(page).toHaveURL(/\/verify-otp\/?\?ref=/, { timeout: 20_000 });
    await otpPage.expectVisible();

    // Fill the 6-digit OTP
    await otpPage.fillOtp(TEST_ACCOUNTS.adminKings.otp);

    // Single-school admin → redirects straight to /dashboard
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 30_000 });

    const dashboard = new DashboardPage(page);
    await dashboard.expectVisible();
  });

  test('teacher can login with email and OTP', async ({ page }) => {
    await loginPage.loginWithEmail(TEST_ACCOUNTS.teacherKings.email);

    await expect(page).toHaveURL(/\/verify-otp\/?\?ref=/, { timeout: 20_000 });
    await otpPage.expectVisible();
    await otpPage.fillOtp(TEST_ACCOUNTS.teacherKings.otp);

    // Single-school teacher → /dashboard
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 30_000 });
  });

  test('parent can login with email and OTP', async ({ page }) => {
    await loginPage.loginWithEmail(TEST_ACCOUNTS.parentSingle.email);

    await expect(page).toHaveURL(/\/verify-otp\/?\?ref=/, { timeout: 20_000 });
    await otpPage.expectVisible();
    await otpPage.fillOtp(TEST_ACCOUNTS.parentSingle.otp);

    // Single-school parent → /dashboard
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 30_000 });
  });

  test('super admin can login with email and OTP', async ({ page }) => {
    await loginPage.loginWithEmail(TEST_ACCOUNTS.superAdmin.email);

    await expect(page).toHaveURL(/\/verify-otp\/?\?ref=/, { timeout: 20_000 });
    await otpPage.expectVisible();
    await otpPage.fillOtp(TEST_ACCOUNTS.superAdmin.otp);

    // Super admin has no schools → /dashboard
    await expect(page).toHaveURL(/\/dashboard\/?/, { timeout: 30_000 });
  });

  test('shows error for empty email submission', async () => {
    await loginPage.submit();
    // Form validation should prevent submission or show error
    // The submit button should remain on the page (no navigation)
    await loginPage.expectVisible();
  });

  test('can navigate to register page', async ({ page }) => {
    await loginPage.goToRegister();
    await expect(page).toHaveURL(/\/register\/?/);
  });

  test('can switch between email and phone tabs', async () => {
    await loginPage.emailTabTrigger.click();
    await expect(loginPage.emailInput).toBeVisible();

    await loginPage.phoneTabTrigger.click();
    await expect(loginPage.phoneInput).toBeVisible();
  });
});
