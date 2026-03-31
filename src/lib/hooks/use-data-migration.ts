'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getMigrationJobs,
  getMigrationJob,
  uploadMigrationFile,
  validateMigrationJob,
  importMigrationJob,
} from '@/lib/api/data-migration';
import { queryClient } from '@/lib/query-client';

// ---------------------------------------------------------------------------
// React Query hooks for data migration
// ---------------------------------------------------------------------------

export function useMigrationJobs() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: ['migration-jobs', schoolId],
    queryFn: () => getMigrationJobs(schoolId!),
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

export function useUploadMigration() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useMutation({
    mutationFn: ({ type, fileUrl }: { type: string; fileUrl: string }) =>
      uploadMigrationFile(schoolId!, type, fileUrl),
    onSuccess: () => {
      toast.success('File uploaded successfully.');
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Upload failed. Please try again.'));
    },
  });
}

export function useValidateMigration() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useMutation({
    mutationFn: (jobId: string) =>
      validateMigrationJob(schoolId!, jobId),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Validation failed. Please check the file and try again.'));
    },
  });
}

export function useImportMigration() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
return useMutation({
    mutationFn: (jobId: string) =>
      importMigrationJob(schoolId!, jobId),
    onSuccess: () => {
      toast.success('Import started successfully.');
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Import failed. Please try again.'));
    },
  });
}
