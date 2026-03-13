import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';

/**
 * Upload a file to the server and return the resulting URL.
 */
export async function uploadFile(
  file: File,
  folder?: string,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await apiClient.post<ApiResponse<string>>(
    '/files/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  return response.data.data;
}
