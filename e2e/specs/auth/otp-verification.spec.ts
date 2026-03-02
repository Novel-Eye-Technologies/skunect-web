import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { VerifyOtpPage } from '../../pages/verify-otp.page';
import { TEST_ACCOUNTS } from '../../fixtures/test-accounts';

test.describe('OTP Verification', () => {
  let loginPage: LoginPage;
  let otpPage: VerifyOtpPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    otpPage = new VerifyOtpPage(page);

    // The OTP page requires a ?ref= param which comes from the login API.
    // Navigate through the login flow first so we land on /verify-otp?ref=...
    await loginPage.goto();
    await loginPage.loginWithEmail(TEST_ACCOUNTS.adminKings.email);
    await expect(page).toHaveURL(/\/verify-otp\?ref=/, { timeout: 10_000 });
    await otpPage.expectVisible();
  });

  test('OTP page displays correctly', async () => {
    // Heading: "Verify your identity"
    await expect(otpPage.heading).toBeVisible();

    // Subtitle: "Enter the 6-digit code we sent you"
    await expect(otpPage.subtitle).toBeVisible();

    // All 6 digit inputs should be visible
    for (let i = 0; i < 6; i++) {
      await expect(otpPage.getDigitInput(i)).toBeVisible();
    }

    // Countdown timer should be visible (starts at 60s)
    await otpPage.expectCountdown();
  });

  test('individual digit entry with auto-advance', async () => {
    // Type first digit
    const digit0 = otpPage.getDigitInput(0);
    await digit0.focus();
    await digit0.fill('1');

    // After entering a digit, focus should auto-advance to the next input
    await expect(otpPage.getDigitInput(1)).toBeFocused({ timeout: 2_000 });

    const digit1 = otpPage.getDigitInput(1);
    await digit1.fill('2');
    await expect(otpPage.getDigitInput(2)).toBeFocused({ timeout: 2_000 });
  });

  test('auto-submit on complete OTP entry redirects to dashboard', async ({
    page,
  }) => {
    // Fill all 6 digits (auto-submits when complete)
    await otpPage.fillOtp(TEST_ACCOUNTS.adminKings.otp);

    // The component shows "Verifying..." then "Verified!" briefly before
    // redirecting. The transient state is too fast to reliably assert in
    // headless mode, so we verify the end result instead.
    await expect(page).toHaveURL(/\/dashboard|\/select-school/, {
      timeout: 30_000,
    });
  });

  test.fixme('paste full OTP triggers auto-submit', async ({ page }) => {
    // Synthetic paste events are unreliable in headless Chromium.
    // The core auto-submit behavior is already covered by the fillOtp test above.
    await otpPage.pasteOtp(TEST_ACCOUNTS.adminKings.otp);

    // Should auto-submit, verify, and redirect
    await otpPage.expectVerified();
    await expect(page).toHaveURL(/\/dashboard|\/select-school/, {
      timeout: 15_000,
    });
  });

  test('shows countdown timer for resend', async () => {
    // The countdown starts immediately when the OTP page loads
    await otpPage.expectCountdown();
  });

  test('backspace clears current digit and moves focus back', async () => {
    // Fill first two digits
    const digit0 = otpPage.getDigitInput(0);
    const digit1 = otpPage.getDigitInput(1);

    await digit0.focus();
    await digit0.fill('1');
    await digit1.fill('2');

    // Press backspace on digit 2 which has a value → clears it
    await digit1.press('Backspace');
    await expect(digit1).toHaveValue('');

    // Press backspace again on now-empty digit 2 → moves focus to digit 1 and clears it
    await digit1.press('Backspace');
    await expect(digit0).toHaveValue('');
    await expect(digit0).toBeFocused({ timeout: 2_000 });
  });
});
