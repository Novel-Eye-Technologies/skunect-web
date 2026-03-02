import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // Elements
  readonly heading: Locator;
  readonly emailTabTrigger: Locator;
  readonly phoneTabTrigger: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly submitButton: Locator;
  readonly registerLink: Locator;
  readonly googleButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /welcome back/i });
    this.emailTabTrigger = page.getByRole('tab', { name: /email/i });
    this.phoneTabTrigger = page.getByRole('tab', { name: /phone/i });
    this.emailInput = page.getByPlaceholder('you@example.com');
    this.phoneInput = page.getByPlaceholder('+234 800 000 0000');
    this.submitButton = page.getByRole('button', { name: /send otp/i });
    this.registerLink = page.getByRole('link', { name: /create account/i });
    this.googleButton = page.getByRole('button', { name: /google/i });
  }

  async goto() {
    await this.page.goto('/login');
    await this.heading.waitFor({ state: 'visible' });
  }

  async fillEmail(email: string) {
    await this.emailTabTrigger.click();
    await this.emailInput.fill(email);
  }

  async fillPhone(phone: string) {
    await this.phoneTabTrigger.click();
    await this.phoneInput.fill(phone);
  }

  async submit() {
    await this.submitButton.click();
  }

  async loginWithEmail(email: string) {
    await this.fillEmail(email);
    await this.submit();
  }

  async loginWithPhone(phone: string) {
    await this.fillPhone(phone);
    await this.submit();
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
  }

  async expectError() {
    // Errors appear as toast notifications (sonner)
    await expect(
      this.page.locator('[data-sonner-toast][data-type="error"]')
    ).toBeVisible({ timeout: 5000 });
  }

  async goToRegister() {
    await this.registerLink.click();
  }
}
