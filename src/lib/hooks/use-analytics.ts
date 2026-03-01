'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getDashboard,
  getAttendanceSummary,
  getAcademicSummary,
  getFeeSummary,
  type AttendanceSummaryParams,
  type AcademicSummaryParams,
  type FeeSummaryParams,
} from '@/lib/api/analytics';

// ---------------------------------------------------------------------------
// React Query hooks for analytics data
// ---------------------------------------------------------------------------

export function useDashboard() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: ['dashboard', schoolId],
    queryFn: () => getDashboard(schoolId!),
    enabled: !!schoolId,
    select: (response) => response.data,
  });
}

export function useAttendanceSummary(params?: AttendanceSummaryParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: ['attendance-summary', schoolId, params],
    queryFn: () => getAttendanceSummary(schoolId!, params),
    enabled: !!schoolId,
    select: (response) => response.data,
  });
}

export function useAcademicSummary(params?: AcademicSummaryParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: ['academic-summary', schoolId, params],
    queryFn: () => getAcademicSummary(schoolId!, params),
    enabled: !!schoolId,
    select: (response) => response.data,
  });
}

export function useFeeSummary(params?: FeeSummaryParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: ['fee-summary', schoolId, params],
    queryFn: () => getFeeSummary(schoolId!, params),
    enabled: !!schoolId,
    select: (response) => response.data,
  });
}
