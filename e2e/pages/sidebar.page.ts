import { type Page, type Locator, expect } from '@playwright/test';

export class SidebarPage {
  readonly page: Page;

  // Elements
  readonly sidebar: Locator;
  readonly collapseButton: Locator;
  readonly profileLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.locator('aside').first();
    this.collapseButton = page.getByRole('button', {
      name: /collapse sidebar|expand sidebar/i,
    });
    this.profileLink = page.getByRole('link', { name: /profile/i });
  }

  /**
   * Navigate to a page via the sidebar.
   * Nav items with children (e.g. School Settings, Communication) render as
   * <button> not <a>. Simple items render as <Link> (<a>).
   * Try link first, then fall back to button.
   */
  async navigateTo(itemTitle: string) {
    const link = this.sidebar.getByRole('link', { name: itemTitle, exact: false });
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      return;
    }
    // For parent nav items with children, click the button to expand then click the child link
    const button = this.sidebar.getByRole('button', { name: itemTitle, exact: false });
    if (await button.isVisible().catch(() => false)) {
      await button.click();
    }
  }

  /**
   * Check that a nav item is visible in the sidebar.
   * Nav items may render as <a> (Link) or <button> (items with children).
   */
  async expectNavItem(itemTitle: string) {
    // Wait for sidebar to be ready
    await expect(this.sidebar).toBeVisible({ timeout: 10_000 });

    // Check for either a link or a button with this name inside the sidebar.
    // Use Playwright's .or() to combine locators so the assertion auto-retries
    // until one of them becomes visible (avoids one-shot isVisible() race condition).
    const link = this.sidebar.getByRole('link', { name: itemTitle, exact: false });
    const button = this.sidebar.getByRole('button', { name: itemTitle, exact: false });

    await expect(link.or(button).first()).toBeVisible({ timeout: 10_000 });
  }

  /** Check that a nav item is NOT visible in the sidebar. */
  async expectNoNavItem(itemTitle: string) {
    await expect(
      this.sidebar.getByRole('link', { name: itemTitle, exact: true })
    ).not.toBeVisible();
    await expect(
      this.sidebar.getByRole('button', { name: itemTitle, exact: true })
    ).not.toBeVisible();
  }

  /**
   * Validate that the sidebar shows exactly the expected top-level nav items.
   * @param items Array of nav item titles (e.g. ['Dashboard', 'Students'])
   */
  async expectNavItems(items: string[]) {
    for (const item of items) {
      await this.expectNavItem(item);
    }
  }

  /** Click the collapse/expand toggle. */
  async toggleCollapse() {
    await this.collapseButton.click();
  }

  /**
   * Click the logout button.
   * Logout lives inside a UserMenu dropdown in the header, not in the sidebar.
   * 1. Click the user avatar trigger (has sr-only text "Open user menu")
   * 2. Click the "Logout" menu item in the dropdown
   */
  async logout() {
    // Open the user menu dropdown (avatar trigger in the header)
    const userMenuTrigger = this.page.getByRole('button', { name: /open user menu/i });
    await userMenuTrigger.click();

    // Click the Logout menu item (Radix DropdownMenuItem with role="menuitem")
    const logoutItem = this.page.getByRole('menuitem', { name: /logout/i });
    await logoutItem.waitFor({ state: 'visible', timeout: 5_000 });
    await logoutItem.click();
  }
}
