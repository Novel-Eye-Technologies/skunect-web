import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { VerifyOtpPage } from '../../pages/verify-otp.page';
import { SelectSchoolPage } from '../../pages/select-school.page';
import { TEST_ACCOUNTS } from '../../fixtures/test-accounts';

test.describe('School Selection', () => {
  test('cross-school parent sees school selection page', async ({ page }) => {
    test.slow(); // Full login → OTP → school-selection flow

    const loginPage = new LoginPage(page);
    const otpPage = new VerifyOtpPage(page);
    const selectSchoolPage = new SelectSchoolPage(page);

    // Login flow
    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_ACCOUNTS.parentCross.email);
    await expect(page).toHaveURL(/\/verify-otp\?ref=/, { timeout: 25_000 });
    await otpPage.expectVisible();
    await otpPage.fillOtp(TEST_ACCOUNTS.parentCross.otp);

    // Cross-school parent has roles at 2+ schools → /select-school
    await expect(page).toHaveURL(/\/select-school/, { timeout: 30_000 });
    await selectSchoolPage.expectVisible();

    // Should show heading and subtitle
    await expect(selectSchoolPage.heading).toHaveText(/select a school/i);
    await expect(selectSchoolPage.subtitle).toBeVisible();

    // Should show at least 2 school cards
    await selectSchoolPage.expectMultipleSchools();
  });

  test('teacher+parent dual role sees school selection page', async ({
    page,
  }) => {
    test.slow(); // Full login → OTP → school-selection flow

    const loginPage = new LoginPage(page);
    const otpPage = new VerifyOtpPage(page);
    const selectSchoolPage = new SelectSchoolPage(page);

    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_ACCOUNTS.teacherParent.email);
    await expect(page).toHaveURL(/\/verify-otp\?ref=/, { timeout: 25_000 });
    await otpPage.expectVisible();
    await otpPage.fillOtp(TEST_ACCOUNTS.teacherParent.otp);

    // Dual-role user has roles at 2+ schools → /select-school
    await expect(page).toHaveURL(/\/select-school/, { timeout: 30_000 });
    await selectSchoolPage.expectVisible();
    await selectSchoolPage.expectMultipleSchools();
  });

  test('selecting a school and continuing redirects to dashboard', async ({
    page,
  }) => {
    test.slow(); // Full login → OTP → school-selection → dashboard flow

    const loginPage = new LoginPage(page);
    const otpPage = new VerifyOtpPage(page);
    const selectSchoolPage = new SelectSchoolPage(page);

    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_ACCOUNTS.parentCross.email);
    await expect(page).toHaveURL(/\/verify-otp\?ref=/, { timeout: 25_000 });
    await otpPage.expectVisible();
    await otpPage.fillOtp(TEST_ACCOUNTS.parentCross.otp);

    await expect(page).toHaveURL(/\/select-school/, { timeout: 30_000 });
    await selectSchoolPage.expectVisible();

    // Select the first visible school and click Continue
    const schoolCards = selectSchoolPage.getSchoolCards();
    await schoolCards.first().waitFor({ state: 'visible', timeout: 10_000 });
    await schoolCards.first().click();
    await selectSchoolPage.continue();

    // Should redirect to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  });

  test('single-school admin skips school selection', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const otpPage = new VerifyOtpPage(page);

    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_ACCOUNTS.adminKings.email);
    await expect(page).toHaveURL(/\/verify-otp\?ref=/, { timeout: 25_000 });
    await otpPage.expectVisible();
    await otpPage.fillOtp(TEST_ACCOUNTS.adminKings.otp);

    // Single-school user should go directly to /dashboard (no /select-school)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  });

  test('super admin skips school selection', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const otpPage = new VerifyOtpPage(page);

    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_ACCOUNTS.superAdmin.email);
    await expect(page).toHaveURL(/\/verify-otp\?ref=/, { timeout: 25_000 });
    await otpPage.expectVisible();
    await otpPage.fillOtp(TEST_ACCOUNTS.superAdmin.otp);

    // Super admin has no schools → goes directly to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  });
});
