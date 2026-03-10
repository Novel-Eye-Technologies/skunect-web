'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getClasses } from '@/lib/api/school-settings';
import { useCreateEvent, useUpdateEvent } from '@/lib/hooks/use-events';
import { useMySubjects } from '@/lib/hooks/use-school-settings';
import type { EventItem } from '@/lib/types/event';

const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  location: z.string().optional(),
  visibility: z.enum(['TEACHERS_ONLY', 'TEACHERS_AND_PARENTS']),
  reminderMinutes: z.string().optional(),
  classId: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: EventItem;
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
}: EventFormDialogProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const currentRole = useAuthStore((s) => s.currentRole);
  const isEdit = !!event;
  const isTeacher = currentRole === 'TEACHER';
  const isAdmin = currentRole === 'ADMIN';

  const [isClassEvent, setIsClassEvent] = useState(false);

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  // Load teacher's assigned subjects to determine their classes
  const { data: mySubjects } = useMySubjects();

  const allClasses = classesResponse ?? [];

  // Filter classes for teachers based on their assignments
  const classes = isTeacher && mySubjects
    ? allClasses.filter((cls) =>
        mySubjects.some((ms) => ms.classId === cls.id),
      )
    : allClasses;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      visibility: 'TEACHERS_AND_PARENTS',
      reminderMinutes: '',
      classId: '',
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (event && open) {
      setIsClassEvent(!!event.classId);
      form.reset({
        title: event.title,
        description: event.description ?? '',
        startTime: event.startTime ? event.startTime.slice(0, 16) : '',
        endTime: event.endTime ? event.endTime.slice(0, 16) : '',
        location: event.location ?? '',
        visibility: event.visibility,
        reminderMinutes: event.reminderMinutes != null ? String(event.reminderMinutes) : '',
        classId: event.classId ?? '',
      });
    } else if (!open) {
      form.reset();
      setIsClassEvent(false);
    }
  }, [event, open, form]);

  function onSubmit(values: EventFormValues) {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      startTime: values.startTime,
      endTime: values.endTime || undefined,
      location: values.location || undefined,
      visibility: values.visibility,
      reminderMinutes: values.reminderMinutes ? Number(values.reminderMinutes) : undefined,
      classId: (isTeacher || isClassEvent) && values.classId ? values.classId : undefined,
    };

    if (isEdit) {
      updateEvent.mutate(
        { eventId: event.id, data: payload },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        },
      );
    } else {
      createEvent.mutate(payload, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    }
  }

  const isPending = createEvent.isPending || updateEvent.isPending;
  const showClassSelector = isTeacher || isClassEvent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Event' : 'Create Event'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the event details below.'
              : 'Fill in the details to create a new event.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Parent-Teacher Meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the event..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start & End Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. School Hall" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visibility */}
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TEACHERS_AND_PARENTS">
                        Teachers &amp; Parents
                      </SelectItem>
                      <SelectItem value="TEACHERS_ONLY">
                        Teachers Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reminder */}
            <FormField
              control={form.control}
              name="reminderMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="No reminder" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="1440">1 day before</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* School vs Class event toggle (Admin only) */}
            {isAdmin && (
              <div className="flex items-center gap-3">
                <Switch
                  checked={isClassEvent}
                  onCheckedChange={setIsClassEvent}
                  id="class-event-toggle"
                />
                <Label htmlFor="class-event-toggle">
                  {isClassEvent ? 'Class Event' : 'School Event'}
                </Label>
              </div>
            )}

            {/* Class Selector */}
            {showClassSelector && (
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class{isTeacher ? '' : ' (Optional)'}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                            {cls.section ? ` (${cls.section})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'Saving...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Event'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
