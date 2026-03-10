'use client';

import { useMemo } from 'react';
import { isSameDay, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { EventItem } from '@/lib/types/event';

interface CalendarViewProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  events: EventItem[];
}

export function CalendarView({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  events,
}: CalendarViewProps) {
  // Build a map of dates that have events, and their type
  const eventDates = useMemo(() => {
    const map = new Map<string, 'school' | 'class' | 'both'>();
    for (const evt of events) {
      const dateKey = evt.startTime.slice(0, 10);
      const existing = map.get(dateKey);
      const type = evt.classId ? 'class' : 'school';
      if (!existing) {
        map.set(dateKey, type);
      } else if (existing !== type) {
        map.set(dateKey, 'both');
      }
    }
    return map;
  }, [events]);

  // Dates that have events — used for modifiers
  const datesWithEvents = useMemo(() => {
    return Array.from(eventDates.keys()).map((d) => parseISO(d));
  }, [eventDates]);

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={onSelectDate}
      month={month}
      onMonthChange={onMonthChange}
      modifiers={{
        hasEvent: datesWithEvents,
      }}
      modifiersClassNames={{
        hasEvent: 'has-event',
      }}
      className="rounded-md border w-full [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(12)]"
      classNames={{
        month: 'w-full',
        table: 'w-full',
        head_row: 'flex w-full',
        row: 'flex w-full',
      }}
      components={{
        DayButton: ({ day, modifiers, className, ...props }) => {
          const dateKey = day.date.toISOString().slice(0, 10);
          const eventType = eventDates.get(dateKey);

          return (
            <button
              className={cn(
                'relative flex aspect-square w-full min-w-(--cell-size) flex-col items-center justify-center rounded-md text-sm font-normal',
                modifiers.selected && 'bg-primary text-primary-foreground',
                modifiers.today && !modifiers.selected && 'bg-accent text-accent-foreground',
                modifiers.outside && 'text-muted-foreground opacity-50',
                !modifiers.selected && !modifiers.today && !modifiers.outside && 'hover:bg-accent',
                className,
              )}
              {...props}
            >
              {day.date.getDate()}
              {eventType && (
                <div className="flex gap-0.5 mt-0.5">
                  {(eventType === 'school' || eventType === 'both') && (
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  )}
                  {(eventType === 'class' || eventType === 'both') && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                </div>
              )}
            </button>
          );
        },
      }}
    />
  );
}

/** Get events for a specific day from the full list */
export function getEventsForDay(events: EventItem[], date: Date): EventItem[] {
  return events.filter((evt) => isSameDay(parseISO(evt.startTime), date));
}
