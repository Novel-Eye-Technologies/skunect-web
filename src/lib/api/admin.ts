import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { SystemDashboardResponse, SchoolSummary } from '@/lib/types/admin';

export async function getSystemDashboard(): Promise<ApiResponse<SystemDashboardResponse>> {
  const response = await apiClient.get<ApiResponse<SystemDashboardResponse>>(
    '/admin/dashboard'
  );
  return response.data;
}

export async function getAllSchools(): Promise<ApiResponse<SchoolSummary[]>> {
  const response = await apiClient.get<ApiResponse<SchoolSummary[]>>(
    '/admin/schools'
  );
  return response.data;
}

export async function resetSeedData(): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    '/admin/seed/reset'
  );
  return response.data;
}
