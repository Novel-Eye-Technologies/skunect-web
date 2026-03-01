import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  MigrationJob,
  ValidationResult,
} from '@/lib/types/data-migration';

// ---------------------------------------------------------------------------
// Data Migration API functions
// ---------------------------------------------------------------------------

export async function validateMigrationFile(
  schoolId: string,
  file: File,
  type: string,
): Promise<ApiResponse<ValidationResult>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await apiClient.post<ApiResponse<ValidationResult>>(
    `/schools/${schoolId}/data-migration/validate`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function importMigrationFile(
  schoolId: string,
  file: File,
  type: string,
): Promise<ApiResponse<MigrationJob>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await apiClient.post<ApiResponse<MigrationJob>>(
    `/schools/${schoolId}/data-migration/import`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function getMigrationJobs(
  schoolId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<MigrationJob[]>> {
  const response = await apiClient.get<ApiResponse<MigrationJob[]>>(
    `/schools/${schoolId}/data-migration/jobs`,
    { params },
  );
  return response.data;
}

export async function getMigrationJob(
  schoolId: string,
  jobId: string,
): Promise<ApiResponse<MigrationJob>> {
  const response = await apiClient.get<ApiResponse<MigrationJob>>(
    `/schools/${schoolId}/data-migration/jobs/${jobId}`,
  );
  return response.data;
}
