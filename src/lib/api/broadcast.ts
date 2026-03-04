import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { Broadcast, CreateBroadcastRequest } from '@/lib/types/broadcast';

export async function getBroadcasts(
  schoolId: string,
  page = 0,
  size = 20,
): Promise<ApiResponse<Broadcast[]>> {
  const response = await apiClient.get<ApiResponse<Broadcast[]>>(
    `/schools/${schoolId}/broadcasts`,
    { params: { page, size } },
  );
  return response.data;
}

export async function createBroadcast(
  schoolId: string,
  data: CreateBroadcastRequest,
): Promise<ApiResponse<Broadcast>> {
  const response = await apiClient.post<ApiResponse<Broadcast>>(
    `/schools/${schoolId}/broadcasts`,
    data,
  );
  return response.data;
}
