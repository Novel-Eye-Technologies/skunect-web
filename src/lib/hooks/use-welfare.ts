'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import { recordWelfare } from '@/lib/api/welfare';
import type { RecordWelfareRequest } from '@/lib/types/welfare';
import { queryClient } from '@/lib/query-client';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const welfareKeys = {
  all: ['welfare'] as const,
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useRecordWelfare() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
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
