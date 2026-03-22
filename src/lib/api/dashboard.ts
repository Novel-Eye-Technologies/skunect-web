import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  AdminDashboardData,
  AttendanceSummaryData,
  FeeSummaryData,
  TeacherDashboardData,
  ParentDashboardData,
  EnhancedAdminDashboard,
} from '@/lib/types/dashboard';

export async function getAdminDashboard(
  schoolId: string,
): Promise<ApiResponse<AdminDashboardData>> {
  const response = await apiClient.get<ApiResponse<AdminDashboardData>>(
    `/schools/${schoolId}/analytics/dashboard`,
  );
  return response.data;
}

export async function getAttendanceSummary(
  schoolId: string,
  from: string,
  to: string,
): Promise<ApiResponse<AttendanceSummaryData>> {
  const response = await apiClient.get<ApiResponse<AttendanceSummaryData>>(
    `/schools/${schoolId}/analytics/attendance`,
    { params: { from, to } },
  );
  return response.data;
}

export async function getFeeSummary(
  schoolId: string,
): Promise<ApiResponse<FeeSummaryData>> {
  const response = await apiClient.get<ApiResponse<FeeSummaryData>>(
    `/schools/${schoolId}/analytics/fees`,
  );
  return response.data;
}

export async function getTeacherDashboard(
  schoolId: string,
): Promise<ApiResponse<TeacherDashboardData>> {
  const response = await apiClient.get<ApiResponse<TeacherDashboardData>>(
    `/schools/${schoolId}/analytics/teacher-dashboard`,
  );
  return response.data;
}

export async function getParentDashboard(
  schoolId: string,
): Promise<ApiResponse<ParentDashboardData>> {
  const response = await apiClient.get<ApiResponse<ParentDashboardData>>(
    '/parents/me/dashboard',
    { params: { schoolId } },
  );
  return response.data;
}

export async function getEnhancedAdminDashboard(
  schoolId: string,
  phase: string = 'MID_TERM',
): Promise<ApiResponse<EnhancedAdminDashboard>> {
  const response = await apiClient.get<ApiResponse<EnhancedAdminDashboard>>(
    `/schools/${schoolId}/analytics/enhanced-dashboard`,
    { params: { phase } },
  );
  return response.data;
}
