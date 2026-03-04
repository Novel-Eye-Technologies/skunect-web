'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getHealthRecords,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  type HealthRecordListParams,
} from '@/lib/api/health-records';
import type {
  CreateHealthRecordRequest,
  UpdateHealthRecordRequest,
} from '@/lib/types/health-record';

const healthRecordKeys = {
  all: ['health-records'] as const,
  list: (schoolId: string, params?: HealthRecordListParams) =>
    [...healthRecordKeys.all, 'list', schoolId, params] as const,
};

export function useHealthRecords(params?: HealthRecordListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: healthRecordKeys.list(schoolId!, params),
    queryFn: () => getHealthRecords(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useCreateHealthRecord() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHealthRecordRequest) =>
      createHealthRecord(schoolId!, data),
    onSuccess: () => {
      toast.success('Health record created successfully');
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.all });
    },
    onError: () => {
      toast.error('Failed to create health record');
    },
  });
}

export function useUpdateHealthRecord() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recordId,
      data,
    }: {
      recordId: string;
      data: UpdateHealthRecordRequest;
    }) => updateHealthRecord(schoolId!, recordId, data),
    onSuccess: () => {
      toast.success('Health record updated successfully');
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.all });
    },
    onError: () => {
      toast.error('Failed to update health record');
    },
  });
}

export function useDeleteHealthRecord() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) => deleteHealthRecord(schoolId!, recordId),
    onSuccess: () => {
      toast.success('Health record deleted successfully');
      queryClient.invalidateQueries({ queryKey: healthRecordKeys.all });
    },
    onError: () => {
      toast.error('Failed to delete health record');
    },
  });
}
