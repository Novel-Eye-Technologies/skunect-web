'use client';

import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek as dateFnsStartOfWeek,
  addDays,
  isSameDay,
  parseISO,
} from 'date-fns';
import { Calendar, CalendarPlus, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useCalendarEvents, useDeleteEvent } from '@/lib/hooks/use-events';
import { CalendarView, getEventsForDay } from '@/components/features/calendar/calendar-view';
import { DayEventsPanel } from '@/components/features/calendar/day-events-panel';
import { EventFormDialog } from '@/components/features/calendar/event-form-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import type { EventItem } from '@/lib/types/event';

/* ------------------------------------------------------------------ */
/*  Week View                                                          */
/* ------------------------------------------------------------------ */

function WeekView({
  events,
  selectedDate,
}: {
  events: EventItem[];
  selectedDate: Date;
}) {
  const weekStart = dateFnsStartOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function eventsForDay(day: Date) {
    return events.filter((evt) => isSameDay(parseISO(evt.startTime), day));
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dayEvents = eventsForDay(day);
        const isToday = isSameDay(day, new Date());

        return (
          <div
            key={day.toISOString()}
            className={`min-h-[200px] border rounded-lg p-2 ${
              isToday ? 'border-primary bg-primary/5' : ''
            }`}
          >
            <div className="text-sm font-medium mb-2">{format(day, 'EEE d')}</div>
            {dayEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground">No events</p>
            ) : (
              dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`text-xs p-1.5 mb-1 rounded ${
                    evt.classId
                      ? 'bg-blue-500/10 text-blue-800'
                      : 'bg-green-500/10 text-green-800'
                  }`}
                >
                  <div className="font-medium truncate">{evt.title}</div>
                  <div className="text-[10px] opacity-70">
                    {format(parseISO(evt.startTime), 'h:mm a')}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Agenda View                                                        */
/* ------------------------------------------------------------------ */

function AgendaView({ events }: { events: EventItem[] }) {
  const upcoming = useMemo(
    () =>
      events
        .filter((e) => new Date(e.startTime) >= new Date())
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
    [events],
  );

  if (upcoming.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No upcoming events"
        description="There are no upcoming events scheduled. Events you create will appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {upcoming.map((evt) => (
        <Card key={evt.id}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="text-center min-w-[48px]">
              <div className="text-2xl font-bold">
                {format(parseISO(evt.startTime), 'd')}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(parseISO(evt.startTime), 'MMM')}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium">{evt.title}</h4>
                {evt.className && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {evt.className}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {format(parseISO(evt.startTime), 'EEEE, h:mm a')}
                {evt.endTime && ` - ${format(parseISO(evt.endTime), 'h:mm a')}`}
              </p>
              {evt.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {evt.location}
                </p>
              )}
              {evt.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {evt.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Calendar Page                                                      */
/* ------------------------------------------------------------------ */

export default function CalendarPage() {
  const currentRole = useAuthStore((s) => s.currentRole);
  const isParent = currentRole === 'PARENT';

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | undefined>(undefined);
  const [activeView, setActiveView] = useState<string>('month');

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
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>

          {/* Month View (existing layout) */}
          <TabsContent value="month">
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
          </TabsContent>

          {/* Week View */}
          <TabsContent value="week">
            <Card>
              <CardContent className="p-4">
                <WeekView
                  events={events}
                  selectedDate={selectedDate ?? new Date()}
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
          </TabsContent>

          {/* Agenda View */}
          <TabsContent value="agenda">
            <AgendaView events={events} />
          </TabsContent>
        </Tabs>
      )}

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        event={editingEvent}
      />
    </div>
  );
}
