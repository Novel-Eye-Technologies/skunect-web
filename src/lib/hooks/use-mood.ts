'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getMoodEntries,
  getStudentMoodEntries,
  createMoodEntry,
  type MoodListParams,
} from '@/lib/api/mood';
import type { CreateMoodEntryRequest } from '@/lib/types/mood';
import { queryClient } from '@/lib/query-client';

const moodKeys = {
  all: ['mood'] as const,
  list: (schoolId: string, params?: MoodListParams) =>
    [...moodKeys.all, 'list', schoolId, params] as const,
  studentHistory: (schoolId: string, studentId: string) =>
    [...moodKeys.all, 'student', schoolId, studentId] as const,
};

export function useMoodEntries(params?: MoodListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: moodKeys.list(schoolId ?? '', params),
    queryFn: () => getMoodEntries(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useStudentMoodHistory(studentId: string | null) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: moodKeys.studentHistory(schoolId ?? '', studentId ?? ''),
    queryFn: () => getStudentMoodEntries(schoolId!, studentId!, { size: 50 }),
    enabled: !!schoolId && !!studentId,
  });
}

export function useCreateMoodEntry() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
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
