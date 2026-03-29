import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  DashboardResponse,
  AttendanceAnalytics,
  AcademicAnalytics,
  FeeAnalytics,
} from '@/lib/types/analytics';

// ---------------------------------------------------------------------------
// Analytics API functions
// ---------------------------------------------------------------------------

export async function getDashboard(
  schoolId: string,
): Promise<ApiResponse<DashboardResponse>> {
  const response = await apiClient.get<ApiResponse<DashboardResponse>>(
    `/schools/${schoolId}/analytics/dashboard`,
  );
  return response.data;
}

export interface AttendanceSummaryParams {
  from?: string;
  to?: string;
  classId?: string;
}

export async function getAttendanceSummary(
  schoolId: string,
  params?: AttendanceSummaryParams,
): Promise<ApiResponse<AttendanceAnalytics>> {
  const response = await apiClient.get<ApiResponse<AttendanceAnalytics>>(
    `/schools/${schoolId}/analytics/attendance`,
    { params },
  );
  return response.data;
}

export interface AcademicSummaryParams {
  sessionId?: string;
  termId?: string;
  classId?: string;
}

export async function getAcademicSummary(
  schoolId: string,
  params?: AcademicSummaryParams,
): Promise<ApiResponse<AcademicAnalytics>> {
  const response = await apiClient.get<ApiResponse<AcademicAnalytics>>(
    `/schools/${schoolId}/analytics/academic`,
    { params },
  );
  return response.data;
}

export interface FeeSummaryParams {
  sessionId?: string;
}

export async function getFeeSummary(
  schoolId: string,
  params?: FeeSummaryParams,
): Promise<ApiResponse<FeeAnalytics>> {
  const response = await apiClient.get<ApiResponse<FeeAnalytics>>(
    `/schools/${schoolId}/analytics/fees`,
    { params },
  );
  return response.data;
}
