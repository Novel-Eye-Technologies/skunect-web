'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getEligibleStudents,
  bulkPromote,
  getPromotionHistory,
  promoteLevel,
} from '@/lib/api/promotions';
import type { BulkPromoteRequest, PromoteLevelRequest } from '@/lib/types/promotion';
import { queryClient } from '@/lib/query-client';

const promotionKeys = {
  all: ['promotions'] as const,
  eligible: (schoolId: string, classId: string, sessionId: string) =>
    [...promotionKeys.all, 'eligible', schoolId, classId, sessionId] as const,
  history: (schoolId: string, sessionId?: string) =>
    [...promotionKeys.all, 'history', schoolId, sessionId] as const,
};

export function useEligibleStudents(classId: string, sessionId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: promotionKeys.eligible(schoolId ?? '', classId, sessionId),
    queryFn: () => getEligibleStudents(schoolId!, classId, sessionId),
    enabled: !!schoolId && !!classId && !!sessionId,
    select: (response) => response.data,
  });
}

export function useBulkPromote() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (data: BulkPromoteRequest) => bulkPromote(schoolId!, data),
    onSuccess: () => {
      toast.success('Students promoted successfully');
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to promote students'));
    },
  });
}

export function usePromotionHistory(sessionId?: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: promotionKeys.history(schoolId ?? '', sessionId),
    queryFn: () => getPromotionHistory(schoolId!, sessionId),
    enabled: !!schoolId,
    select: (response) => response.data,
  });
}

/**
 * SCRUM-63 PR 6: Promote an entire level. Returns the full PromoteLevelResponse
 * via the mutation's data so callers can render both the promoted list and the
 * unmatched list (students whose source class had no suffix-matched destination).
 */
export function usePromoteLevel() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (data: PromoteLevelRequest) => promoteLevel(schoolId!, data),
    onSuccess: (response) => {
      const promoted = response.data?.promoted?.length ?? 0;
      const unmatched = response.data?.unmatched?.length ?? 0;
      if (promoted > 0 && unmatched === 0) {
        toast.success(`Promoted ${promoted} student(s) successfully`);
      } else if (promoted > 0 && unmatched > 0) {
        toast.success(
          `Promoted ${promoted} student(s); ${unmatched} need manual handling`,
        );
      } else if (promoted === 0 && unmatched > 0) {
        toast.warning(
          `${unmatched} student(s) could not be auto-mapped; handle manually`,
        );
      } else {
        toast.success('No students to promote');
      }
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to promote level'));
    },
  });
}
