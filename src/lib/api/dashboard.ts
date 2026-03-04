import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { ParentDashboardData } from '@/lib/types/dashboard';

export async function getParentDashboard(
  schoolId: string,
): Promise<ApiResponse<ParentDashboardData>> {
  const response = await apiClient.get<ApiResponse<ParentDashboardData>>(
    '/parents/me/dashboard',
    { params: { schoolId } },
  );
  return response.data;
}
