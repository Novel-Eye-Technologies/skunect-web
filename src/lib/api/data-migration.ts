import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { MigrationJob } from '@/lib/types/data-migration';

// ---------------------------------------------------------------------------
// Data Migration API functions
//
// Backend flow: upload file first → then validate job → then import job.
// Base path: /schools/{schoolId}/migrations
// ---------------------------------------------------------------------------

export async function uploadMigrationFile(
  schoolId: string,
  type: string,
  fileUrl: string,
): Promise<ApiResponse<MigrationJob>> {
  const response = await apiClient.post<ApiResponse<MigrationJob>>(
    `/schools/${schoolId}/migrations/upload`,
    null,
    { params: { type, fileUrl } },
  );
  return response.data;
}

export async function validateMigrationJob(
  schoolId: string,
  jobId: string,
): Promise<ApiResponse<MigrationJob>> {
  const response = await apiClient.post<ApiResponse<MigrationJob>>(
    `/schools/${schoolId}/migrations/${jobId}/validate`,
  );
  return response.data;
}

export async function importMigrationJob(
  schoolId: string,
  jobId: string,
): Promise<ApiResponse<MigrationJob>> {
  const response = await apiClient.post<ApiResponse<MigrationJob>>(
    `/schools/${schoolId}/migrations/${jobId}/import`,
  );
  return response.data;
}

export async function getMigrationJobs(
  schoolId: string,
): Promise<ApiResponse<MigrationJob[]>> {
  const response = await apiClient.get<ApiResponse<MigrationJob[]>>(
    `/schools/${schoolId}/migrations`,
  );
  return response.data;
}

export async function getMigrationJob(
  schoolId: string,
  jobId: string,
): Promise<ApiResponse<MigrationJob>> {
  const response = await apiClient.get<ApiResponse<MigrationJob>>(
    `/schools/${schoolId}/migrations/${jobId}`,
  );
  return response.data;
}
