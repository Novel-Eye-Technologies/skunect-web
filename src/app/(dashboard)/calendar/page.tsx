'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarPlus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCalendarEvents, useDeleteEvent } from '@/lib/hooks/use-events';
import { CalendarView, getEventsForDay } from '@/components/features/calendar/calendar-view';
import { DayEventsPanel } from '@/components/features/calendar/day-events-panel';
import { EventFormDialog } from '@/components/features/calendar/event-form-dialog';
import type { EventItem } from '@/lib/types/event';

export default function CalendarPage() {
  const currentRole = useAuthStore((s) => s.currentRole);
  const isParent = currentRole === 'PARENT';

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | undefined>(undefined);

  const from = format(startOfMonth(month), 'yyyy-MM-dd');
  const to = format(endOfMonth(month), 'yyyy-MM-dd');

  const { data: response, isLoading } = useCalendarEvents(from, to);
  const events = useMemo(() => response?.data ?? [], [response?.data]);
  const deleteEvent = useDeleteEvent();

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDay(events, selectedDate);
  }, [events, selectedDate]);

  function handleEdit(event: EventItem) {
    setEditingEvent(event);
    setDialogOpen(true);
  }

  function handleDelete(eventId: string) {
    deleteEvent.mutate(eventId);
  }

  function handleCreate() {
    setEditingEvent(undefined);
    setDialogOpen(true);
  }

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setEditingEvent(undefined);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="View and manage school events and schedules."
        actions={
          !isParent ? (
            <Button onClick={handleCreate}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardContent className="p-4">
              <CalendarView
                month={month}
                onMonthChange={setMonth}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                events={events}
              />
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  School Event
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Class Event
                </span>
              </div>
            </CardContent>
          </Card>

          {selectedDate && (
            <DayEventsPanel
              date={selectedDate}
              events={selectedDayEvents}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        event={editingEvent}
      />
    </div>
  );
}
