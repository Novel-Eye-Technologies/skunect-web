'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { useEvents, useCreateEvent, useDeleteEvent } from '@/lib/hooks/use-events';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils/format-date';
import { CalendarPlus, MapPin, Users, Trash2 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  UPCOMING: 'bg-blue-100 text-blue-800',
  ONGOING: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function EventsPage() {
  const { data: response, isLoading } = useEvents();
  const events = response?.data ?? [];
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');

  const handleCreate = () => {
    if (!title.trim() || !eventDate) return;
    createEvent.mutate(
      { title, description: description || undefined, eventDate, endDate: endDate || undefined, location: location || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setDescription('');
          setEventDate('');
          setEndDate('');
          setLocation('');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Manage school events, assign coordinators, and track schedules."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Event location" />
                </div>
                <Button onClick={handleCreate} disabled={createEvent.isPending} className="w-full">
                  {createEvent.isPending ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarPlus className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No events scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt) => (
            <Card key={evt.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{evt.title}</h3>
                      <Badge className={STATUS_COLORS[evt.status] ?? ''} variant="secondary">
                        {evt.status}
                      </Badge>
                    </div>
                    {evt.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{evt.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span>{formatDate(evt.eventDate)}{evt.endDate ? ` — ${formatDate(evt.endDate)}` : ''}</span>
                      {evt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {evt.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {evt.targetAudience}
                      </span>
                    </div>
                    {evt.coordinators?.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Coordinators: {evt.coordinators.map((c) => c.teacherName).join(', ')}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => deleteEvent.mutate(evt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
