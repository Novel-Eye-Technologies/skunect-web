import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  SystemDashboardResponse,
  SchoolSummary,
  SchoolDetail,
  SchoolDetailResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  CreateSchoolAdminRequest,
  UpdateSchoolAdminRequest,
  CreateSuperAdminRequest,
  UpdateSuperAdminRequest,
  SuperAdminUser,
} from '@/lib/types/admin';

// ── Dashboard ────────────────────────────────────────────────────────

export async function getSystemDashboard(): Promise<ApiResponse<SystemDashboardResponse>> {
  const response = await apiClient.get<ApiResponse<SystemDashboardResponse>>(
    '/admin/dashboard'
  );
  return response.data;
}

// ── Schools ──────────────────────────────────────────────────────────

export async function getAllSchools(): Promise<ApiResponse<SchoolSummary[]>> {
  const response = await apiClient.get<ApiResponse<SchoolSummary[]>>(
    '/admin/schools'
  );
  return response.data;
}

export async function getSchool(schoolId: string): Promise<ApiResponse<SchoolDetailResponse>> {
  const response = await apiClient.get<ApiResponse<SchoolDetailResponse>>(
    `/admin/schools/${schoolId}`
  );
  return response.data;
}

export async function createSchool(data: CreateSchoolRequest): Promise<ApiResponse<SchoolDetail>> {
  const response = await apiClient.post<ApiResponse<SchoolDetail>>(
    '/admin/schools',
    data
  );
  return response.data;
}

export async function updateSchool(schoolId: string, data: UpdateSchoolRequest): Promise<ApiResponse<SchoolDetail>> {
  const response = await apiClient.put<ApiResponse<SchoolDetail>>(
    `/admin/schools/${schoolId}`,
    data
  );
  return response.data;
}

export async function deactivateSchool(schoolId: string): Promise<ApiResponse<null>> {
  const response = await apiClient.patch<ApiResponse<null>>(
    `/admin/schools/${schoolId}/deactivate`
  );
  return response.data;
}

export async function activateSchool(schoolId: string): Promise<ApiResponse<SchoolDetail>> {
  const response = await apiClient.patch<ApiResponse<SchoolDetail>>(
    `/admin/schools/${schoolId}/activate`
  );
  return response.data;
}

export async function deleteSchool(schoolId: string): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/admin/schools/${schoolId}`
  );
  return response.data;
}

// ── School Admins ────────────────────────────────────────────────────

export async function createSchoolAdmin(schoolId: string, data: CreateSchoolAdminRequest): Promise<ApiResponse<SuperAdminUser>> {
  const response = await apiClient.post<ApiResponse<SuperAdminUser>>(
    `/admin/schools/${schoolId}/admins`,
    data
  );
  return response.data;
}

export async function getSchoolAdmins(schoolId: string): Promise<ApiResponse<SuperAdminUser[]>> {
  const response = await apiClient.get<ApiResponse<SuperAdminUser[]>>(
    `/admin/schools/${schoolId}/admins`
  );
  return response.data;
}

export async function updateSchoolAdmin(schoolId: string, userId: string, data: UpdateSchoolAdminRequest): Promise<ApiResponse<SuperAdminUser>> {
  const response = await apiClient.put<ApiResponse<SuperAdminUser>>(
    `/admin/schools/${schoolId}/admins/${userId}`,
    data
  );
  return response.data;
}

export async function deactivateSchoolAdmin(schoolId: string, userId: string): Promise<ApiResponse<null>> {
  const response = await apiClient.patch<ApiResponse<null>>(
    `/admin/schools/${schoolId}/admins/${userId}/deactivate`
  );
  return response.data;
}

export async function activateSchoolAdmin(schoolId: string, userId: string): Promise<ApiResponse<SuperAdminUser>> {
  const response = await apiClient.patch<ApiResponse<SuperAdminUser>>(
    `/admin/schools/${schoolId}/admins/${userId}/activate`
  );
  return response.data;
}

export async function deleteSchoolAdmin(schoolId: string, userId: string): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/admin/schools/${schoolId}/admins/${userId}`
  );
  return response.data;
}

// ── Super Admins ─────────────────────────────────────────────────────

export async function getAllSuperAdmins(): Promise<ApiResponse<SuperAdminUser[]>> {
  const response = await apiClient.get<ApiResponse<SuperAdminUser[]>>(
    '/admin/super-admins'
  );
  return response.data;
}

export async function createSuperAdmin(data: CreateSuperAdminRequest): Promise<ApiResponse<SuperAdminUser>> {
  const response = await apiClient.post<ApiResponse<SuperAdminUser>>(
    '/admin/super-admins',
    data
  );
  return response.data;
}

export async function updateSuperAdmin(userId: string, data: UpdateSuperAdminRequest): Promise<ApiResponse<SuperAdminUser>> {
  const response = await apiClient.put<ApiResponse<SuperAdminUser>>(
    `/admin/super-admins/${userId}`,
    data
  );
  return response.data;
}

export async function deactivateSuperAdmin(userId: string): Promise<ApiResponse<null>> {
  const response = await apiClient.patch<ApiResponse<null>>(
    `/admin/super-admins/${userId}/deactivate`
  );
  return response.data;
}

export async function activateSuperAdmin(userId: string): Promise<ApiResponse<SuperAdminUser>> {
  const response = await apiClient.patch<ApiResponse<SuperAdminUser>>(
    `/admin/super-admins/${userId}/activate`
  );
  return response.data;
}

export async function deleteSuperAdmin(userId: string): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/admin/super-admins/${userId}`
  );
  return response.data;
}

// ── Seed Data ────────────────────────────────────────────────────────

export async function resetSeedData(): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    '/admin/seed/reset'
  );
  return response.data;
}
