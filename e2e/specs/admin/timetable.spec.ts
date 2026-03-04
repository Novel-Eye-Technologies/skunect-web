import fs from 'fs';
import path from 'path';
import { test, expect } from '../../fixtures/auth.fixture';
import { TimetablePage } from '../../pages/timetable.page';
import { apiGet, apiDelete } from '../../helpers/api.helper';

test.describe('Timetable Management (CRUD)', () => {
  const slotLabel = `E2E Slot ${Date.now()}`;

  // Clean up stale E2E timetable slots from previous runs
  test.beforeAll(async () => {
    try {
      const authFile = path.resolve(process.cwd(), '.auth/admin-kings.json');
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      const zustand = JSON.parse(authData.origins[0].localStorage[0].value);
      const token = zustand.state.accessToken as string;
      const schoolId = zustand.state.currentSchoolId as string;

      const res = await apiGet<Array<{ id: string; label?: string }>>(
        `/schools/${schoolId}/timetable/slots?size=200`,
        token,
      );
      const staleSlots = (res.data ?? []).filter(
        (s) => s.label?.startsWith('E2E Slot'),
      );
      for (const s of staleSlots) {
        await apiDelete(
          `/schools/${schoolId}/timetable/slots/${s.id}`,
          token,
        ).catch(() => {});
      }
    } catch {
      // Cleanup is best-effort
    }
  });

  test('admin can navigate to timetable page', async ({ adminPage }) => {
    const timetable = new TimetablePage(adminPage);
    await timetable.goto();
    await timetable.expectVisible();
  });

  test('shows empty state when no session/class selected', async ({
    adminPage,
  }) => {
    const timetable = new TimetablePage(adminPage);
    await timetable.goto();
    await timetable.expectEmptyState();
  });

  test('admin can select session and class to view grid', async ({
    adminPage,
  }) => {
    const timetable = new TimetablePage(adminPage);
    await timetable.goto();
    await timetable.expectVisible();

    // Select the first session
    await timetable.selectSession(0);
    // Select the first class
    await timetable.selectClass(0);

    // Grid should appear
    await timetable.expectGridVisible();
  });

  test('timetable grid shows day headers', async ({ adminPage }) => {
    const timetable = new TimetablePage(adminPage);
    await timetable.goto();
    await timetable.selectSession(0);
    await timetable.selectClass(0);
    await timetable.expectGridVisible();
    await timetable.expectGridHeaders();
  });

  test('admin can create a new timetable slot', async ({ adminPage }) => {
    const timetable = new TimetablePage(adminPage);
    await timetable.goto();
    await timetable.selectSession(0);
    await timetable.selectClass(0);
    await timetable.expectGridVisible();

    // Click on an empty slot (Monday Period 1)
    await timetable.clickEmptySlot('MONDAY', 1);
    await timetable.fillSlotForm(slotLabel);
    await timetable.submitSlotForm();

    // Dialog should close and slot should appear in grid
    await expect(timetable.slotDialog).not.toBeVisible({ timeout: 5_000 });
    await timetable.expectSlotInGrid(slotLabel);
  });

  test('admin can delete a timetable slot', async ({ adminPage }) => {
    const timetable = new TimetablePage(adminPage);
    await timetable.goto();
    await timetable.selectSession(0);
    await timetable.selectClass(0);
    await timetable.expectGridVisible();

    // Create a slot to delete
    const deleteLabel = `E2E Slot Del ${Date.now()}`;
    await timetable.clickEmptySlot('FRIDAY', 2);
    await timetable.fillSlotForm(deleteLabel);
    await timetable.submitSlotForm();
    await expect(timetable.slotDialog).not.toBeVisible({ timeout: 5_000 });
    await timetable.expectSlotInGrid(deleteLabel);

    // Delete it
    await timetable.deleteSlot(deleteLabel);
    await timetable.expectSlotNotInGrid(deleteLabel);
  });

  test('cancel button closes slot dialog without saving', async ({
    adminPage,
  }) => {
    const timetable = new TimetablePage(adminPage);
    await timetable.goto();
    await timetable.selectSession(0);
    await timetable.selectClass(0);
    await timetable.expectGridVisible();

    await timetable.clickEmptySlot('TUESDAY', 3);
    await timetable.fillSlotForm('Should Not Save');
    await timetable.cancelSlotButton.click();

    await expect(timetable.slotDialog).not.toBeVisible({ timeout: 3_000 });
  });

  test('grid has period rows matching config', async ({ adminPage }) => {
    const timetable = new TimetablePage(adminPage);
    await timetable.goto();
    await timetable.selectSession(0);
    await timetable.selectClass(0);
    await timetable.expectGridVisible();

    // Grid should have period labels (P1, P2, etc.)
    await expect(
      timetable.timetableGrid.locator('td').getByText('P1')
    ).toBeVisible();
  });
});
