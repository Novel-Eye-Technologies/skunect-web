import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  StudentListItem,
  StudentDetail,
  CreateStudentRequest,
  UpdateStudentRequest,
  LinkParentRequest,
  StudentDocument,
} from '@/lib/types/student';

// ---------------------------------------------------------------------------
// Student API functions
// ---------------------------------------------------------------------------

export interface StudentListParams extends PaginatedParams {
  classId?: string;
  status?: string;
  search?: string;
}

export async function getStudents(
  schoolId: string,
  params?: StudentListParams,
): Promise<ApiResponse<StudentListItem[]>> {
  const response = await apiClient.get<ApiResponse<StudentListItem[]>>(
    `/schools/${schoolId}/students`,
    { params },
  );
  return response.data;
}

export async function getStudent(
  schoolId: string,
  studentId: string,
): Promise<ApiResponse<StudentDetail>> {
  const response = await apiClient.get<ApiResponse<StudentDetail>>(
    `/schools/${schoolId}/students/${studentId}`,
  );
  return response.data;
}

export async function createStudent(
  schoolId: string,
  data: CreateStudentRequest,
): Promise<ApiResponse<StudentDetail>> {
  const response = await apiClient.post<ApiResponse<StudentDetail>>(
    `/schools/${schoolId}/students`,
    data,
  );
  return response.data;
}

export async function updateStudent(
  schoolId: string,
  studentId: string,
  data: UpdateStudentRequest,
): Promise<ApiResponse<StudentDetail>> {
  const response = await apiClient.put<ApiResponse<StudentDetail>>(
    `/schools/${schoolId}/students/${studentId}`,
    data,
  );
  return response.data;
}

export async function deleteStudent(
  schoolId: string,
  studentId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/schools/${schoolId}/students/${studentId}`,
  );
  return response.data;
}

export async function linkParent(
  schoolId: string,
  studentId: string,
  data: LinkParentRequest,
): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    `/schools/${schoolId}/students/${studentId}/parents`,
    data,
  );
  return response.data;
}

export async function unlinkParent(
  schoolId: string,
  studentId: string,
  parentId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/schools/${schoolId}/students/${studentId}/parents/${parentId}`,
  );
  return response.data;
}

export async function uploadDocument(
  schoolId: string,
  studentId: string,
  file: File,
): Promise<ApiResponse<StudentDocument>> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<StudentDocument>>(
    `/schools/${schoolId}/students/${studentId}/documents`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function deleteDocument(
  schoolId: string,
  studentId: string,
  documentId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/schools/${schoolId}/students/${studentId}/documents/${documentId}`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Profile API
// ---------------------------------------------------------------------------

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export async function updateProfile(
  data: UpdateProfileRequest,
): Promise<ApiResponse<null>> {
  const response = await apiClient.put<ApiResponse<null>>(
    '/users/profile',
    data,
  );
  return response.data;
}
