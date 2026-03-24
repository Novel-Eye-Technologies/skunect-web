'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getEligibleStudents,
  bulkPromote,
  getPromotionHistory,
} from '@/lib/api/promotions';
import type { BulkPromoteRequest } from '@/lib/types/promotion';
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
