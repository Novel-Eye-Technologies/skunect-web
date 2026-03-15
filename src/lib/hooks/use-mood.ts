'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getMoodEntries,
  createMoodEntry,
  type MoodListParams,
} from '@/lib/api/mood';
import type { CreateMoodEntryRequest } from '@/lib/types/mood';

const moodKeys = {
  all: ['mood'] as const,
  list: (schoolId: string, params?: MoodListParams) =>
    [...moodKeys.all, 'list', schoolId, params] as const,
};

export function useMoodEntries(params?: MoodListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: moodKeys.list(schoolId ?? '', params),
    queryFn: () => getMoodEntries(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useCreateMoodEntry() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMoodEntryRequest) =>
      createMoodEntry(schoolId!, data),
    onSuccess: () => {
      toast.success('Mood entry recorded successfully');
      queryClient.invalidateQueries({ queryKey: moodKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to record mood entry'));
    },
  });
}
