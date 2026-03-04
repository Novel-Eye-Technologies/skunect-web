import { test, expect } from '@playwright/test';
import { LandingPage } from '../../pages/landing.page';

// Landing page tests use unauthenticated context (no auth fixture)
test.describe('Landing Page', () => {
  test('unauthenticated user sees landing page', async ({ page }) => {
    // Clear any stored auth state
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const landing = new LandingPage(page);
    await landing.goto();
    await landing.expectVisible();
    await expect(landing.heroDescription).toBeVisible();
  });

  test('landing page shows feature cards', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const landing = new LandingPage(page);
    await landing.goto();
    await landing.expectVisible();
    await expect(landing.featuresSection).toBeVisible();
  });

  test('Get Started button links to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const landing = new LandingPage(page);
    await landing.goto();
    await landing.expectVisible();
    await expect(landing.getStartedButton).toHaveAttribute('href', '/login');
  });

  test('Sign In button links to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const landing = new LandingPage(page);
    await landing.goto();
    await landing.expectVisible();
    await expect(landing.signInButton).toHaveAttribute('href', '/login');
  });
});
