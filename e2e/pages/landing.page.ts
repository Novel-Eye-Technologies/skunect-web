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
      name: /Stay Connected to Your Child/i,
    });
    this.heroDescription = page.getByText(
      /bridges the gap between schools and parents/i
    );
    this.getStartedButton = page
      .getByRole('link', { name: 'Get Started', exact: true })
      .first();
    this.signInButton = page
      .getByRole('link', { name: /Sign In/i })
      .first();
    this.featuresSection = page.getByRole('heading', {
      name: /Everything Your School Needs/i,
    });
  }

  async goto() {
    await this.page.goto('/');
  }

  async expectVisible() {
    await expect(this.heroHeading).toBeVisible({ timeout: 15_000 });
  }
}
