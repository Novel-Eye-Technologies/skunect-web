'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getAttendanceRecords,
  submitBulkAttendance,
  getAttendanceSummary,
  type AttendanceListParams,
  type AttendanceSummaryParams,
} from '@/lib/api/attendance';
import type { BulkAttendanceRequest } from '@/lib/types/attendance';
import { queryClient } from '@/lib/query-client';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const attendanceKeys = {
  all: ['attendance'] as const,
  records: (schoolId: string, params?: AttendanceListParams) =>
    [...attendanceKeys.all, 'records', schoolId, params] as const,
  summary: (schoolId: string, params?: AttendanceSummaryParams) =>
    [...attendanceKeys.all, 'summary', schoolId, params] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useAttendanceRecords(params?: AttendanceListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: attendanceKeys.records(schoolId ?? '', params),
    queryFn: () => getAttendanceRecords(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useAttendanceSummary(params?: AttendanceSummaryParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: attendanceKeys.summary(schoolId ?? '', params),
    queryFn: () => getAttendanceSummary(schoolId!, params!),
    enabled: !!schoolId && !!params?.classId && !!params?.startDate && !!params?.endDate,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useSubmitBulkAttendance() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
return useMutation({
    mutationFn: (data: BulkAttendanceRequest) =>
      submitBulkAttendance(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toast.success('Attendance submitted successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to submit attendance'));
    },
  });
}
