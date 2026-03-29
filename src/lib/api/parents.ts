import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type { UserListItem } from '@/lib/types/user';
import type { ParentLinkInfo } from '@/lib/types/parent';
import type { Api } from '@/lib/api/schema';

export type ChildSummary = Api['ChildResponse'];

// ---------------------------------------------------------------------------
// Parent API functions
// Uses the same /users endpoint with role=PARENT filter
// ---------------------------------------------------------------------------

export interface ParentListParams extends PaginatedParams {
  status?: string;
  search?: string;
}

export async function getParents(
  schoolId: string,
  params?: ParentListParams,
): Promise<ApiResponse<UserListItem[]>> {
  const response = await apiClient.get<ApiResponse<UserListItem[]>>(
    `/schools/${schoolId}/users`,
    { params: { ...params, role: 'PARENT' } },
  );
  return response.data;
}

export async function getStudentParents(
  schoolId: string,
  studentId: string,
): Promise<ApiResponse<ParentLinkInfo[]>> {
  const response = await apiClient.get<ApiResponse<ParentLinkInfo[]>>(
    `/students/${studentId}/parents`,
  );
  return response.data;
}

export async function getParent(
  schoolId: string,
  parentId: string,
): Promise<ApiResponse<UserListItem>> {
  const response = await apiClient.get<ApiResponse<UserListItem>>(
    `/schools/${schoolId}/users/${parentId}`,
  );
  return response.data;
}

export async function getParentChildren(
  schoolId: string,
  parentId: string,
): Promise<ApiResponse<ChildSummary[]>> {
  const response = await apiClient.get<ApiResponse<ChildSummary[]>>(
    `/schools/${schoolId}/parents/${parentId}/children`,
  );
  return response.data;
}

