'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getLevels,
  createLevel,
  updateLevel,
  deleteLevel,
  moveClassesBetweenLevels,
} from '@/lib/api/levels';
import type {
  CreateLevelRequest,
  UpdateLevelRequest,
  MoveClassesRequest,
} from '@/lib/types/levels';
import { queryClient } from '@/lib/query-client';
import { schoolSettingsKeys } from '@/lib/hooks/use-school-settings';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const levelKeys = {
  all: ['levels'] as const,
  list: (schoolId: string) => [...levelKeys.all, schoolId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useLevels() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: levelKeys.list(schoolId ?? ''),
    queryFn: () => getLevels(schoolId!),
    enabled: !!schoolId,
    select: (response) => response.data,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateLevel() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (data: CreateLevelRequest) => createLevel(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: levelKeys.list(schoolId ?? '') });
      toast.success('Level created successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create level'));
    },
  });
}

export function useUpdateLevel() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: ({
      levelId,
      data,
    }: {
      levelId: string;
      data: UpdateLevelRequest;
    }) => updateLevel(schoolId!, levelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: levelKeys.list(schoolId ?? '') });
      toast.success('Level updated successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update level'));
    },
  });
}

export function useDeleteLevel() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (levelId: string) => deleteLevel(schoolId!, levelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: levelKeys.list(schoolId ?? '') });
      toast.success('Level deleted successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete level'));
    },
  });
}

export function useMoveClassesBetweenLevels() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: ({
      sourceLevelId,
      data,
    }: {
      sourceLevelId: string;
      data: MoveClassesRequest;
    }) => moveClassesBetweenLevels(schoolId!, sourceLevelId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: levelKeys.list(schoolId ?? '') });
      // Class list also depends on level_id, so invalidate it too
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.classes(schoolId ?? ''),
      });
      toast.success(
        `${response.data?.count ?? 0} class(es) moved successfully`,
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to move classes'));
    },
  });
}
