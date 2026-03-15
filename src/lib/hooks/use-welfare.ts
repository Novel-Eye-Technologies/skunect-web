'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  recordWelfare,
  getWelfareRecords,
  type WelfareListParams,
} from '@/lib/api/welfare';
import type { RecordWelfareRequest } from '@/lib/types/welfare';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const welfareKeys = {
  all: ['welfare'] as const,
  list: (schoolId: string, params?: WelfareListParams) =>
    [...welfareKeys.all, 'list', schoolId, params] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useWelfareRecords(params?: WelfareListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: welfareKeys.list(schoolId ?? '', params),
    queryFn: () => getWelfareRecords(schoolId!, params),
    enabled: !!schoolId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useRecordWelfare() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordWelfareRequest) =>
      recordWelfare(schoolId!, data),
    onSuccess: () => {
      toast.success('Welfare record saved successfully');
      queryClient.invalidateQueries({ queryKey: welfareKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to save welfare record'));
    },
  });
}
