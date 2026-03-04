import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { ActivityFeedItem } from '@/lib/types/activity';

export async function getActivityFeed(
  schoolId: string,
  limit: number = 20,
): Promise<ApiResponse<ActivityFeedItem[]>> {
  const response = await apiClient.get<ApiResponse<ActivityFeedItem[]>>(
    `/schools/${schoolId}/activity`,
    { params: { limit } },
  );
  return response.data;
}
