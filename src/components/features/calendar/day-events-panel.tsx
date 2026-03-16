'use client';

import { format, parseISO } from 'date-fns';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { EventItem } from '@/lib/types/event';

interface DayEventsPanelProps {
  date: Date;
  events: EventItem[];
  onEdit: (event: EventItem) => void;
  onDelete: (eventId: string) => void;
}

export function DayEventsPanel({
  date,
  events,
  onEdit,
  onDelete,
}: DayEventsPanelProps) {
  const currentRole = useAuthStore((s) => s.currentRole);
  const isAdmin = currentRole === 'ADMIN';
  const isParent = currentRole === 'PARENT';

  // Sort events by startTime
  const sorted = [...events].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );

  function formatTimeRange(event: EventItem): string {
    const start = format(parseISO(event.startTime), 'h:mm a');
    if (event.endTime) {
      const end = format(parseISO(event.endTime), 'h:mm a');
      return `${start} - ${end}`;
    }
    return start;
  }

  function canEditEvent(event: EventItem): boolean {
    if (isParent) return false;
    if (isAdmin) return true;
    // Teacher can only edit their own class events
    return !!event.classId;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No events on this day.
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.map((evt) => (
              <div
                key={evt.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm">{evt.title}</h4>
                    {evt.className && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {evt.className}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        evt.visibility === 'TEACHERS_ONLY'
                          ? 'border-amber-300 text-amber-700'
                          : 'border-green-300 text-green-700'
                      }
                    >
                      {evt.visibility === 'TEACHERS_ONLY'
                        ? 'Teachers Only'
                        : 'All'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeRange(evt)}
                  </p>
                  {evt.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {evt.location}
                    </p>
                  )}
                  {evt.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                      {evt.description}
                    </p>
                  )}
                </div>
                {canEditEvent(evt) && (
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Edit event"
                      onClick={() => onEdit(evt)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      aria-label="Delete event"
                      onClick={() => onDelete(evt.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
