import { type Page, type Locator, expect } from '@playwright/test';

export class VerifyOtpPage {
  readonly page: Page;

  // Elements
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly verifyingText: Locator;
  readonly verifiedText: Locator;
  readonly resendButton: Locator;
  readonly countdownText: Locator;

  constructor(page: Page) {
    this.page = page;

    // h2 "Verify your identity" (case-insensitive)
    this.heading = page.getByRole('heading', { name: /verify your identity/i });

    // p "Enter the 6-digit code we sent you"
    this.subtitle = page.getByText('Enter the 6-digit code we sent you');

    // Shown while the verify API call is in-flight
    this.verifyingText = page.getByText('Verifying...');

    // h3 "Verified!" shown on success (before redirect)
    this.verifiedText = page.getByRole('heading', { name: /verified!/i });

    // Resend button (visible after countdown expires)
    this.resendButton = page.getByRole('button', { name: /resend code/i });

    // Countdown text e.g. "Resend code in 0:59"
    this.countdownText = page.getByText(/resend code in/i);
  }

  /** Get the nth OTP digit input (0-indexed). Each input has aria-label "Digit N". */
  getDigitInput(index: number): Locator {
    return this.page.getByLabel(`Digit ${index + 1}`);
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Fill all 6 OTP digits one-by-one using pressSequentially to simulate
   * real typing. Each digit triggers onChange which auto-advances focus
   * to the next input. After the 6th digit the component auto-submits.
   */
  async fillOtp(otp: string) {
    if (otp.length !== 6) throw new Error('OTP must be 6 digits');

    for (let i = 0; i < 6; i++) {
      const input = this.getDigitInput(i);
      await input.focus();
      await input.fill(otp[i]);
    }
  }

  /**
   * Paste all 6 digits into the first input (uses clipboard paste event).
   * The component only listens for paste on the first input (index 0).
   */
  async pasteOtp(otp: string) {
    if (otp.length !== 6) throw new Error('OTP must be 6 digits');

    const firstInput = this.getDigitInput(0);
    await firstInput.focus();
    // Dispatch a synthetic paste event with the OTP string
    await this.page.evaluate((code) => {
      const input = document.querySelector<HTMLInputElement>(
        'input[aria-label="Digit 1"]'
      );
      if (!input) return;
      const clipboardData = new DataTransfer();
      clipboardData.setData('text', code);
      const event = new ClipboardEvent('paste', {
        bubbles: true,
        clipboardData,
      });
      input.dispatchEvent(event);
    }, otp);
  }

  /** Assert the "Verifying..." loading state is visible. */
  async expectVerifying() {
    await expect(this.verifyingText).toBeVisible({ timeout: 5_000 });
  }

  /** Assert the "Verified!" success state is visible. */
  async expectVerified() {
    await expect(this.verifiedText).toBeVisible({ timeout: 10_000 });
  }

  /** Assert that a sonner error toast is visible. */
  async expectError() {
    await expect(
      this.page.locator('[data-sonner-toast][data-type="error"]')
    ).toBeVisible({ timeout: 5000 });
  }

  /** Assert the "Resend code" button is visible (countdown expired). */
  async expectResendAvailable() {
    await expect(this.resendButton).toBeVisible();
  }

  /** Assert the countdown timer text is visible. */
  async expectCountdown() {
    await expect(this.countdownText).toBeVisible();
  }
}
