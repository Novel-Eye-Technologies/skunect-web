import { test, expect } from '../../fixtures/auth.fixture';
import { FeesPage } from '../../pages/fees.page';

test.describe('Fees Management', () => {
  test('admin can view fees page', async ({ adminPage }) => {
    const fees = new FeesPage(adminPage);
    // Route is /fees (not /fees/invoices)
    await fees.goto();
    await fees.expectVisible();
    await expect(fees.description).toBeVisible();
  });

  test('admin sees Fee Structures and Invoices tabs', async ({
    adminPage,
  }) => {
    const fees = new FeesPage(adminPage);
    await fees.goto();
    await fees.expectVisible();
    await expect(fees.feeStructuresTab).toBeVisible();
    await expect(fees.invoicesTab).toBeVisible();
  });

  test('admin sees Create Structure button on structures tab', async ({
    adminPage,
  }) => {
    const fees = new FeesPage(adminPage);
    await fees.goto();
    await fees.expectVisible();
    await fees.switchToFeeStructures();
    await expect(fees.createStructureButton).toBeVisible();
  });

  test('admin sees Generate Invoices button on invoices tab', async ({
    adminPage,
  }) => {
    const fees = new FeesPage(adminPage);
    await fees.goto();
    await fees.expectVisible();
    await fees.switchToInvoices();
    await expect(fees.generateInvoicesButton).toBeVisible();
  });

  test('parent is redirected away from /fees (admin-only route)', async ({ parentPage }) => {
    // /fees is in ADMIN_ONLY_ROUTES so parents get redirected to /dashboard
    await parentPage.goto('/fees');
    await expect(parentPage).toHaveURL(/\/dashboard\/?/, { timeout: 10_000 });
  });
});
