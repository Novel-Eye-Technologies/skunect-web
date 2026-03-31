import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  UserListItem,
  InviteUserRequest,
  UpdateUserStatusRequest,
  UpdateSchoolUserRequest,
} from '@/lib/types/user';

// ---------------------------------------------------------------------------
// User API functions
// ---------------------------------------------------------------------------

export interface UserListParams extends PaginatedParams {
  role?: string;
  status?: string;
  search?: string;
}

export async function getUsers(
  schoolId: string,
  params?: UserListParams,
): Promise<ApiResponse<UserListItem[]>> {
  const response = await apiClient.get<ApiResponse<UserListItem[]>>(
    `/schools/${schoolId}/users`,
    { params },
  );
  return response.data;
}

export function getContacts(
  schoolId: string,
  params?: UserListParams,
): Promise<ApiResponse<UserListItem[]>> {
  return apiClient
    .get<ApiResponse<UserListItem[]>>(`/messaging/schools/${schoolId}/contacts`, { params })
    .then((response) => response.data);
}

export async function inviteUser(
  schoolId: string,
  data: InviteUserRequest,
): Promise<ApiResponse<UserListItem>> {
  const response = await apiClient.post<ApiResponse<UserListItem>>(
    `/schools/${schoolId}/users/invite`,
    data,
  );
  return response.data;
}

export async function updateUserStatus(
  schoolId: string,
  userId: string,
  data: UpdateUserStatusRequest,
): Promise<ApiResponse<UserListItem>> {
  const response = await apiClient.put<ApiResponse<UserListItem>>(
    `/schools/${schoolId}/users/${userId}/status`,
    data,
  );
  return response.data;
}

export async function updateSchoolUser(
  schoolId: string,
  userId: string,
  data: UpdateSchoolUserRequest,
): Promise<ApiResponse<UserListItem>> {
  const response = await apiClient.put<ApiResponse<UserListItem>>(
    `/schools/${schoolId}/users/${userId}`,
    data,
  );
  return response.data;
}

export async function removeUser(
  schoolId: string,
  userId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/schools/${schoolId}/users/${userId}`,
  );
  return response.data;
}
