import fs from 'fs';
import path from 'path';
import { test, expect } from '../../fixtures/auth.fixture';
import { EventsPage } from '../../pages/events.page';
import { apiGet, apiDelete } from '../../helpers/api.helper';

test.describe('Events Management (CRUD)', () => {
  // Clean up stale E2E events from previous runs
  test.beforeAll(async () => {
    try {
      const authFile = path.resolve(process.cwd(), '.auth/admin-kings.json');
      const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
      const zustand = JSON.parse(authData.origins[0].localStorage[0].value);
      const token = zustand.state.accessToken as string;
      const schoolId = zustand.state.currentSchoolId as string;

      const res = await apiGet<Array<{ id: string; title: string }>>(
        `/schools/${schoolId}/events?size=200`,
        token,
      );
      const staleEvents = (res.data ?? []).filter(
        (e) => e.title.startsWith('E2E Event') || e.title.startsWith('Delete E2E'),
      );
      for (const e of staleEvents) {
        await apiDelete(
          `/schools/${schoolId}/events/${e.id}`,
          token,
        ).catch(() => {});
      }
    } catch {
      // Cleanup is best-effort
    }
  });

  test('admin can navigate to events page', async ({ adminPage }) => {
    const events = new EventsPage(adminPage);
    await events.goto();
    await events.expectVisible();
  });

  test('admin sees events page description', async ({ adminPage }) => {
    const events = new EventsPage(adminPage);
    await events.goto();
    await expect(
      adminPage.getByText(/manage school events/i)
    ).toBeVisible();
  });

  test('admin can open create event dialog', async ({ adminPage }) => {
    const events = new EventsPage(adminPage);
    await events.goto();
    await events.clickCreateEvent();
    await expect(events.dialog).toBeVisible();
    await expect(
      events.dialog.getByRole('heading', { name: /create event/i })
    ).toBeVisible();
  });

  test('admin can create an event with all fields', async ({ adminPage }) => {
    const events = new EventsPage(adminPage);
    await events.goto();
    await events.expectVisible();

    const uniqueTitle = `E2E Event ${Date.now()}`;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().split('T')[0];

    const endDate = new Date(futureDate);
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = endDate.toISOString().split('T')[0];

    await events.clickCreateEvent();
    await events.fillEventForm({
      title: uniqueTitle,
      description: 'E2E test event description',
      startDate: dateStr,
      endDate: endDateStr,
      location: 'School Auditorium',
    });
    await events.submitEvent();

    // Dialog should close
    await expect(events.dialog).not.toBeVisible({ timeout: 5_000 });
    // Event should appear in list
    await events.expectEventInList(uniqueTitle);
  });

  test('admin can create a minimal event (title and date only)', async ({
    adminPage,
  }) => {
    const events = new EventsPage(adminPage);
    await events.goto();
    await events.expectVisible();

    const uniqueTitle = `E2E Event Min ${Date.now()}`;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);
    const dateStr = futureDate.toISOString().split('T')[0];

    await events.clickCreateEvent();
    await events.fillEventForm({
      title: uniqueTitle,
      startDate: dateStr,
    });
    await events.submitEvent();

    await expect(events.dialog).not.toBeVisible({ timeout: 5_000 });
    await events.expectEventInList(uniqueTitle);
  });

  test('admin can delete an event', async ({ adminPage }) => {
    const events = new EventsPage(adminPage);
    await events.goto();
    await events.expectVisible();

    // Create an event to delete
    const deleteTitle = `Delete E2E ${Date.now()}`;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);
    const dateStr = futureDate.toISOString().split('T')[0];

    await events.clickCreateEvent();
    await events.fillEventForm({
      title: deleteTitle,
      startDate: dateStr,
    });
    await events.submitEvent();
    await expect(events.dialog).not.toBeVisible({ timeout: 5_000 });
    await events.expectEventInList(deleteTitle);

    // Delete the event
    await events.deleteEvent(deleteTitle);
    await events.expectEventNotInList(deleteTitle);
  });

  test('event card shows status badge', async ({ adminPage }) => {
    const events = new EventsPage(adminPage);
    await events.goto();
    await events.expectVisible();

    const cards = adminPage.locator('[data-slot="card"]');
    const count = await cards.count();
    if (count > 0) {
      const badge = cards.first().locator('[data-slot="badge"]');
      await expect(badge).toBeVisible();
    }
  });

  test('event card shows location when provided', async ({ adminPage }) => {
    const events = new EventsPage(adminPage);
    await events.goto();
    await events.expectVisible();

    // Create event with location
    const uniqueTitle = `E2E Event Loc ${Date.now()}`;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    const dateStr = futureDate.toISOString().split('T')[0];

    await events.clickCreateEvent();
    await events.fillEventForm({
      title: uniqueTitle,
      startDate: dateStr,
      location: 'Main Hall',
    });
    await events.submitEvent();
    await expect(events.dialog).not.toBeVisible({ timeout: 5_000 });

    await events.expectEventLocation(uniqueTitle, 'Main Hall');
  });

  test('dialog closes on escape key', async ({ adminPage }) => {
    const events = new EventsPage(adminPage);
    await events.goto();
    await events.clickCreateEvent();

    await adminPage.keyboard.press('Escape');
    await expect(events.dialog).not.toBeVisible({ timeout: 3_000 });
  });
});
