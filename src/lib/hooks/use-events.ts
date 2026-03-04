'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getEvents, createEvent, updateEvent, deleteEvent } from '@/lib/api/events';
import type { CreateEventRequest, UpdateEventRequest } from '@/lib/types/event';

export const eventKeys = {
  all: ['events'] as const,
  list: (schoolId: string) => [...eventKeys.all, 'list', schoolId] as const,
};

export function useEvents() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useQuery({
    queryKey: eventKeys.list(schoolId!),
    queryFn: () => getEvents(schoolId!),
    enabled: !!schoolId,
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
    onError: () => toast.error('Failed to create event'),
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
    onError: () => toast.error('Failed to update event'),
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
    onError: () => toast.error('Failed to delete event'),
  });
}
