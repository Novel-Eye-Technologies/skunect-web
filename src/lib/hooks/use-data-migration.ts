'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import type { PaginatedParams } from '@/lib/api/types';
import {
  getMigrationJobs,
  getMigrationJob,
  validateMigrationFile,
  importMigrationFile,
} from '@/lib/api/data-migration';
import { queryClient } from '@/lib/query-client';

// ---------------------------------------------------------------------------
// React Query hooks for data migration
// ---------------------------------------------------------------------------

export function useMigrationJobs(params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: ['migration-jobs', schoolId, params],
    queryFn: () => getMigrationJobs(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useMigrationJob(jobId: string | null) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: ['migration-job', schoolId, jobId],
    queryFn: () => getMigrationJob(schoolId!, jobId!),
    enabled: !!schoolId && !!jobId,
    select: (response) => response.data,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      // Poll while the job is still in progress
      if (
        status === 'PENDING' ||
        status === 'VALIDATING' ||
        status === 'IMPORTING'
      ) {
        return 3000;
      }
      return false;
    },
  });
}

export function useValidateMigration() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) =>
      validateMigrationFile(schoolId!, file, type),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Validation failed. Please check the file and try again.'));
    },
  });
}

export function useImportMigration() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
return useMutation({
    mutationFn: ({ file, type }: { file: File; type: string }) =>
      importMigrationFile(schoolId!, file, type),
    onSuccess: () => {
      toast.success('Import started successfully.');
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Import failed. Please try again.'));
    },
  });
}
