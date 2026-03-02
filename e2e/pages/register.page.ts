import { type Page, type Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;

  // Elements
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /create your account/i });
    this.firstNameInput = page.getByPlaceholder('John');
    this.lastNameInput = page.getByPlaceholder('Doe');
    this.emailInput = page.getByPlaceholder('you@example.com');
    this.phoneInput = page.getByPlaceholder('+234 800 000 0000');
    this.submitButton = page.getByRole('button', { name: /create account/i });
    this.loginLink = page.getByRole('link', { name: /sign in/i });
  }

  async goto() {
    await this.page.goto('/register');
    await this.heading.waitFor({ state: 'visible' });
  }

  async fillForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible();
  }

  async expectError() {
    await expect(
      this.page.locator('[data-sonner-toast][data-type="error"]')
    ).toBeVisible({ timeout: 5000 });
  }

  async goToLogin() {
    await this.loginLink.click();
  }
}
