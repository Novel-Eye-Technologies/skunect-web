'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import { getEvents, getCalendarEvents, createEvent, updateEvent, deleteEvent } from '@/lib/api/events';
import type { CreateEventRequest, UpdateEventRequest } from '@/lib/types/event';

export const eventKeys = {
  all: ['events'] as const,
  list: (schoolId: string) => [...eventKeys.all, 'list', schoolId] as const,
  calendar: (schoolId: string, from: string, to: string) =>
    [...eventKeys.all, 'calendar', schoolId, from, to] as const,
};

export function useEvents() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useQuery({
    queryKey: eventKeys.list(schoolId ?? ''),
    queryFn: () => getEvents(schoolId!),
    enabled: !!schoolId,
  });
}

export function useCalendarEvents(from: string, to: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useQuery({
    queryKey: eventKeys.calendar(schoolId ?? '', from, to),
    queryFn: () => getCalendarEvents(schoolId!, from, to),
    enabled: !!schoolId && !!from && !!to,
  });
}

export function useCreateEvent() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) => createEvent(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success('Event created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create event')),
  });
}

export function useUpdateEvent() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: UpdateEventRequest }) =>
      updateEvent(schoolId!, eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success('Event updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update event')),
  });
}

export function useDeleteEvent() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(schoolId!, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      toast.success('Event deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete event')),
  });
}
