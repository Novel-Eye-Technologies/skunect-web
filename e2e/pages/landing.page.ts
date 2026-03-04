import { type Page, type Locator, expect } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly heroHeading: Locator;
  readonly heroDescription: Locator;
  readonly getStartedButton: Locator;
  readonly signInButton: Locator;
  readonly featuresSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroHeading = page.getByRole('heading', {
      name: /School Management/i,
    });
    this.heroDescription = page.getByText(
      /connects schools, teachers, and parents/i
    );
    this.getStartedButton = page.getByRole('link', {
      name: /Get Started/i,
    });
    this.signInButton = page.getByRole('link', { name: /Sign In/i });
    this.featuresSection = page.getByRole('heading', {
      name: /Everything You Need/i,
    });
  }

  async goto() {
    await this.page.goto('/');
  }

  async expectVisible() {
    await expect(this.heroHeading).toBeVisible({ timeout: 15_000 });
  }
}
