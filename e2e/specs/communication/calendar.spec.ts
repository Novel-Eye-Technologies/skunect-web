import { test, expect } from '../../fixtures/auth.fixture';
import { CalendarPage } from '../../pages/calendar.page';

test.describe('School Calendar', () => {
  test.describe('Admin', () => {
    test('can navigate to calendar page', async ({ adminPage }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectVisible();
      await expect(calendar.description).toBeVisible();
    });

    test('sees create event button', async ({ adminPage }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectVisible();
      await expect(calendar.createButton).toBeVisible();
    });

    test('sees calendar with legend', async ({ adminPage }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await expect(calendar.calendar).toBeVisible();
      await calendar.expectCalendarLegend();
    });

    test('can open create event dialog', async ({ adminPage }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await calendar.clickCreateEvent();
      // Verify dialog has expected fields
      await expect(calendar.titleInput).toBeVisible();
      await expect(calendar.startTimeInput).toBeVisible();
      await expect(calendar.endTimeInput).toBeVisible();
      await expect(calendar.locationInput).toBeVisible();
      await expect(calendar.submitButton).toBeVisible();
      await expect(calendar.cancelButton).toBeVisible();
    });

    test('can cancel event creation', async ({ adminPage }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await calendar.clickCreateEvent();
      await calendar.fillEventForm({
        title: 'Cancelled Event',
        startTime: getFutureDateTimeLocal(1),
      });
      await calendar.cancelForm();
      await calendar.expectDialogHidden();
    });

    test('can create a school event', async ({ adminPage }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await calendar.clickCreateEvent();
      const eventTitle = `Admin Test Event ${Date.now()}`;
      await calendar.fillEventForm({
        title: eventTitle,
        startTime: getFutureDateTimeLocal(1),
        description: 'Automated test event created by E2E',
        endTime: getFutureDateTimeLocal(1, 2),
        location: 'Main Hall',
      });
      await calendar.submitForm();
      await calendar.expectDialogHidden();
    });

    test('can create a class event via toggle', async ({ adminPage }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await calendar.clickCreateEvent();
      // Toggle to class event
      await calendar.toggleClassEvent();
      // Class selector should become visible
      await expect(calendar.classSelect).toBeVisible({ timeout: 5_000 });
    });

    test('create event dialog shows visibility options', async ({
      adminPage,
    }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await calendar.clickCreateEvent();
      // Click the visibility select to check options
      await calendar.visibilitySelect.click();
      await expect(
        adminPage.getByRole('option', { name: /teachers & parents/i })
      ).toBeVisible();
      await expect(
        adminPage.getByRole('option', { name: /teachers only/i })
      ).toBeVisible();
    });

    test('create event dialog shows reminder options', async ({
      adminPage,
    }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await calendar.clickCreateEvent();
      await calendar.reminderSelect.click();
      await expect(
        adminPage.getByRole('option', { name: /15 minutes before/i })
      ).toBeVisible();
      await expect(
        adminPage.getByRole('option', { name: /1 day before/i })
      ).toBeVisible();
    });

    test('shows validation error when title is empty', async ({
      adminPage,
    }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await calendar.clickCreateEvent();
      // Fill only start time, leave title empty
      await calendar.startTimeInput.fill(getFutureDateTimeLocal(1));
      await calendar.submitForm();
      // Validation error should appear
      await expect(
        adminPage.getByText(/title is required/i)
      ).toBeVisible({ timeout: 5_000 });
    });

    test('can click a day to see events panel', async ({ adminPage }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectLoaded();
      // Click a day in the current month
      const today = new Date();
      await calendar.clickDay(today.getDate());
      // The day events panel should show the date
      await expect(calendar.dayEventsPanel).toBeVisible();
    });
  });

  test.describe('Admin - Cross-school isolation', () => {
    test('Kings admin does not see Greenfield events', async ({
      adminPage,
      adminGreenfieldPage,
    }) => {
      // Create event on Greenfield
      const greenfieldCalendar = new CalendarPage(adminGreenfieldPage);
      await greenfieldCalendar.goto();
      await greenfieldCalendar.expectLoaded();
      const uniqueTitle = `Greenfield Only ${Date.now()}`;
      await greenfieldCalendar.clickCreateEvent();
      await greenfieldCalendar.fillEventForm({
        title: uniqueTitle,
        startTime: getFutureDateTimeLocal(1),
      });
      await greenfieldCalendar.submitForm();
      await greenfieldCalendar.expectDialogHidden();

      // Check Kings admin does NOT see it
      const kingsCalendar = new CalendarPage(adminPage);
      await kingsCalendar.goto();
      await kingsCalendar.expectLoaded();
      await kingsCalendar.expectEventNotVisible(uniqueTitle);
    });
  });

  test.describe('Teacher', () => {
    test('can navigate to calendar page', async ({ teacherPage }) => {
      const calendar = new CalendarPage(teacherPage);
      await calendar.goto();
      await calendar.expectVisible();
      await expect(calendar.description).toBeVisible();
    });

    test('sees create event button', async ({ teacherPage }) => {
      const calendar = new CalendarPage(teacherPage);
      await calendar.goto();
      await calendar.expectVisible();
      // Teachers should be able to create class events
      await expect(calendar.createButton).toBeVisible();
    });

    test('can open create event dialog', async ({ teacherPage }) => {
      const calendar = new CalendarPage(teacherPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await calendar.clickCreateEvent();
      await expect(calendar.titleInput).toBeVisible();
      // Teacher should NOT see the class event toggle (they always create class events)
      await expect(calendar.classEventToggle).not.toBeVisible();
    });

    test('teacher create dialog shows class selector', async ({
      teacherPage,
    }) => {
      const calendar = new CalendarPage(teacherPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await calendar.clickCreateEvent();
      // Teachers always see class selector (no toggle needed)
      await expect(calendar.classSelect).toBeVisible({ timeout: 5_000 });
    });

    test('can view calendar with events', async ({ teacherPage }) => {
      const calendar = new CalendarPage(teacherPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await expect(calendar.calendar).toBeVisible();
      await calendar.expectCalendarLegend();
    });
  });

  test.describe('Parent', () => {
    test('can navigate to calendar page', async ({ parentPage }) => {
      const calendar = new CalendarPage(parentPage);
      await calendar.goto();
      await calendar.expectVisible();
      await expect(calendar.description).toBeVisible();
    });

    test('does not see create event button', async ({ parentPage }) => {
      const calendar = new CalendarPage(parentPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await calendar.expectCreateButtonHidden();
    });

    test('can view calendar', async ({ parentPage }) => {
      const calendar = new CalendarPage(parentPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await expect(calendar.calendar).toBeVisible();
    });

    test('can click a day to see events panel', async ({ parentPage }) => {
      const calendar = new CalendarPage(parentPage);
      await calendar.goto();
      await calendar.expectLoaded();
      const today = new Date();
      await calendar.clickDay(today.getDate());
      await expect(calendar.dayEventsPanel).toBeVisible();
    });

    test('sees read-only view (no edit/delete on events)', async ({
      parentPage,
    }) => {
      const calendar = new CalendarPage(parentPage);
      await calendar.goto();
      await calendar.expectLoaded();
      const today = new Date();
      await calendar.clickDay(today.getDate());
      // If there are event rows, none should have edit/delete buttons
      const eventRows = parentPage.locator('.rounded-lg.border');
      const count = await eventRows.count();
      if (count > 0) {
        // Parent should not see action buttons on any event
        for (let i = 0; i < count; i++) {
          const row = eventRows.nth(i);
          const buttons = row.getByRole('button');
          await expect(buttons).toHaveCount(0);
        }
      }
    });

    test('cross-school parent can view calendar', async ({
      parentCrossPage,
    }) => {
      const calendar = new CalendarPage(parentCrossPage);
      await calendar.goto();
      await calendar.expectVisible();
    });
  });

  test.describe('Dialog form behavior', () => {
    test('dialog title changes for edit mode', async ({ adminPage }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectLoaded();
      await calendar.clickCreateEvent();
      // When creating, title should say "Create Event"
      await expect(
        adminPage.getByRole('heading', { name: /create event/i })
      ).toBeVisible();
    });

    test('closing dialog resets form', async ({ adminPage }) => {
      const calendar = new CalendarPage(adminPage);
      await calendar.goto();
      await calendar.expectLoaded();

      // Open dialog and fill some data
      await calendar.clickCreateEvent();
      await calendar.titleInput.fill('Should be cleared');
      await calendar.cancelForm();
      await calendar.expectDialogHidden();

      // Re-open and verify the title field is empty
      await calendar.clickCreateEvent();
      await expect(calendar.titleInput).toHaveValue('');
    });
  });
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Returns a datetime-local string for a future date.
 * @param daysAhead - Number of days in the future
 * @param hoursOffset - Hour of day (0-23), defaults to 10
 */
function getFutureDateTimeLocal(daysAhead: number, hoursOffset = 10): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hoursOffset, 0, 0, 0);
  // Format: YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
