import { type Page, type Locator, expect } from '@playwright/test';

export class BusPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly description: Locator;
  readonly routesTab: Locator;
  readonly busesTab: Locator;
  readonly enrollmentsTab: Locator;
  readonly tripsTab: Locator;
  readonly addRouteButton: Locator;
  readonly addBusButton: Locator;
  readonly enrollStudentButton: Locator;
  readonly createTripButton: Locator;
  readonly dataTable: Locator;
  readonly dialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /bus management/i });
    this.description = page.getByText(
      'Manage school bus routes, buses, student enrollments, and trips.'
    );
    this.routesTab = page.getByRole('tab', { name: /routes/i });
    this.busesTab = page.getByRole('tab', { name: /buses/i });
    this.enrollmentsTab = page.getByRole('tab', { name: /enrollments/i });
    this.tripsTab = page.getByRole('tab', { name: /trips/i });
    this.addRouteButton = page.getByRole('button', { name: /add route/i });
    this.addBusButton = page.getByRole('button', { name: /add bus/i });
    this.enrollStudentButton = page.getByRole('button', { name: /enroll student/i });
    this.createTripButton = page.getByRole('button', { name: /create trip/i });
    this.dataTable = page.locator('table');
    this.dialog = page.locator('[data-slot="dialog-content"]');
  }

  async goto() {
    await this.page.goto('/bus');
  }

  async expectVisible() {
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async switchToRoutes() {
    await this.routesTab.click();
  }

  async switchToBuses() {
    await this.busesTab.click();
  }

  async switchToEnrollments() {
    await this.enrollmentsTab.click();
  }

  async switchToTrips() {
    await this.tripsTab.click();
  }

  async createRoute(routeName: string, description?: string, pickupPoints?: string) {
    await this.addRouteButton.click();
    await expect(this.dialog).toBeVisible();

    await this.dialog.getByLabel('Route Name').fill(routeName);
    if (description) {
      await this.dialog.getByLabel('Description').fill(description);
    }
    if (pickupPoints) {
      await this.dialog.getByLabel('Pickup Points').fill(pickupPoints);
    }

    await this.dialog.getByRole('button', { name: /create route/i }).click();
  }

  async createBus(
    plateNumber: string,
    capacity: string,
    driverName: string,
    driverPhone: string,
    routeName?: string,
  ) {
    await this.addBusButton.click();
    await expect(this.dialog).toBeVisible();

    if (routeName) {
      await this.dialog.getByRole('combobox').first().click();
      await this.page.getByRole('option', { name: routeName }).click();
    }

    await this.dialog.getByLabel('Plate Number').fill(plateNumber);
    await this.dialog.getByLabel('Capacity').fill(capacity);
    await this.dialog.getByLabel('Driver Name').fill(driverName);
    await this.dialog.getByLabel('Driver Phone').fill(driverPhone);

    await this.dialog.getByRole('button', { name: /add bus/i }).click();
  }

  async enrollStudent(busPlateAndDriver: string, studentName: string, pickupPoint?: string) {
    await this.enrollStudentButton.click();
    await expect(this.dialog).toBeVisible();

    // Select bus
    const busCombo = this.dialog.getByRole('combobox').first();
    await busCombo.click();
    await this.page.getByRole('option', { name: busPlateAndDriver }).click();

    // Select student
    const studentCombo = this.dialog.getByRole('combobox').nth(1);
    await studentCombo.click();
    await this.page.getByRole('option', { name: studentName }).click();

    if (pickupPoint) {
      await this.dialog.getByLabel(/pickup point/i).fill(pickupPoint);
    }

    await this.dialog.getByRole('button', { name: /enroll student/i }).click();
  }

  async expectRouteInTable(routeName: string) {
    await expect(this.dataTable.getByText(routeName)).toBeVisible({ timeout: 10_000 });
  }

  async expectBusInTable(plateNumber: string) {
    await expect(this.dataTable.getByText(plateNumber)).toBeVisible({ timeout: 10_000 });
  }

  async expectEnrollmentInTable(indicator: string) {
    await expect(this.dataTable.getByText(indicator)).toBeVisible({ timeout: 10_000 });
  }

  async expectEnrollmentRowCount(count: number) {
    await expect(this.dataTable.locator('tbody tr')).toHaveCount(count, { timeout: 10_000 });
  }
}
