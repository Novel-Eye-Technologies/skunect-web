import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type { UserListItem } from '@/lib/types/user';

// ---------------------------------------------------------------------------
// Teacher API functions
// Uses the same /users endpoint with role=TEACHER filter
// ---------------------------------------------------------------------------

export interface TeacherListParams extends PaginatedParams {
  status?: string;
  search?: string;
}

export async function getTeachers(
  schoolId: string,
  params?: TeacherListParams,
): Promise<ApiResponse<UserListItem[]>> {
  const response = await apiClient.get<ApiResponse<UserListItem[]>>(
    `/schools/${schoolId}/users`,
    { params: { ...params, role: 'TEACHER' } },
  );
  return response.data;
}

export async function getTeacher(
  schoolId: string,
  teacherId: string,
): Promise<ApiResponse<UserListItem>> {
  const response = await apiClient.get<ApiResponse<UserListItem>>(
    `/schools/${schoolId}/users/${teacherId}`,
  );
  return response.data;
}
