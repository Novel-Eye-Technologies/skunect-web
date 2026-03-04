import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  HealthRecord,
  CreateHealthRecordRequest,
  UpdateHealthRecordRequest,
} from '@/lib/types/health-record';

export interface HealthRecordListParams {
  studentId?: string;
  recordType?: string;
  page?: number;
  size?: number;
}

export async function getHealthRecords(
  schoolId: string,
  params?: HealthRecordListParams,
): Promise<ApiResponse<HealthRecord[]>> {
  const response = await apiClient.get<ApiResponse<HealthRecord[]>>(
    `/schools/${schoolId}/health-records`,
    { params },
  );
  return response.data;
}

export async function getStudentHealthRecords(
  schoolId: string,
  studentId: string,
  params?: { page?: number; size?: number },
): Promise<ApiResponse<HealthRecord[]>> {
  const response = await apiClient.get<ApiResponse<HealthRecord[]>>(
    `/schools/${schoolId}/health-records/students/${studentId}`,
    { params },
  );
  return response.data;
}

export async function createHealthRecord(
  schoolId: string,
  data: CreateHealthRecordRequest,
): Promise<ApiResponse<HealthRecord>> {
  const response = await apiClient.post<ApiResponse<HealthRecord>>(
    `/schools/${schoolId}/health-records`,
    data,
  );
  return response.data;
}

export async function updateHealthRecord(
  schoolId: string,
  recordId: string,
  data: UpdateHealthRecordRequest,
): Promise<ApiResponse<HealthRecord>> {
  const response = await apiClient.put<ApiResponse<HealthRecord>>(
    `/schools/${schoolId}/health-records/${recordId}`,
    data,
  );
  return response.data;
}

export async function deleteHealthRecord(
  schoolId: string,
  recordId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/schools/${schoolId}/health-records/${recordId}`,
  );
  return response.data;
}
