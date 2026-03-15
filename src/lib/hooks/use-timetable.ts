'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getTimetableConfig,
  saveTimetableConfig,
  getTimetableSlots,
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
} from '@/lib/api/timetable';
import type { CreateTimetableSlotRequest, TimetableConfigRequest } from '@/lib/types/timetable';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const timetableKeys = {
  all: ['timetable'] as const,
  config: (schoolId: string, sessionId: string) =>
    [...timetableKeys.all, 'config', schoolId, sessionId] as const,
  slots: (schoolId: string, sessionId: string, classId?: string) =>
    [...timetableKeys.all, 'slots', schoolId, sessionId, classId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useTimetableConfig(sessionId?: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useQuery({
    queryKey: timetableKeys.config(schoolId ?? '', sessionId!),
    queryFn: () => getTimetableConfig(schoolId!, sessionId!),
    enabled: !!schoolId && !!sessionId,
    select: (res) => res.data,
  });
}

export function useTimetableSlots(sessionId?: string, classId?: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useQuery({
    queryKey: timetableKeys.slots(schoolId ?? '', sessionId!, classId),
    queryFn: () => getTimetableSlots(schoolId!, sessionId!, classId),
    enabled: !!schoolId && !!sessionId,
    select: (res) => res.data,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useSaveTimetableConfig() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TimetableConfigRequest) => saveTimetableConfig(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success('Timetable configuration saved');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save configuration')),
  });
}

export function useCreateTimetableSlot() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTimetableSlotRequest) => createTimetableSlot(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success('Slot created');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to create slot. Check for conflicts.')),
  });
}

export function useUpdateTimetableSlot() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, data }: { slotId: string; data: CreateTimetableSlotRequest }) =>
      updateTimetableSlot(schoolId!, slotId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success('Slot updated');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update slot')),
  });
}

export function useDeleteTimetableSlot() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotId: string) => deleteTimetableSlot(schoolId!, slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      toast.success('Slot deleted');
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete slot')),
  });
}
