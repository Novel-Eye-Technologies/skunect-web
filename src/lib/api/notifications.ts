import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type { NotificationItem } from '@/lib/types/notifications';

// ---------------------------------------------------------------------------
// Notification API functions
// ---------------------------------------------------------------------------

export interface NotificationListParams extends PaginatedParams {
  read?: boolean;
}

export async function getNotifications(
  _schoolId: string,
  params?: NotificationListParams,
): Promise<ApiResponse<NotificationItem[]>> {
  const response = await apiClient.get<ApiResponse<NotificationItem[]>>(
    `/notifications`,
    { params },
  );
  return response.data;
}

export async function markNotificationAsRead(
  _schoolId: string,
  notificationId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.put<ApiResponse<null>>(
    `/notifications/${notificationId}/read`,
  );
  return response.data;
}

export async function markAllNotificationsAsRead(
  _schoolId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.put<ApiResponse<null>>(
    `/notifications/read-all`,
  );
  return response.data;
}

export async function getUnreadCount() : Promise<ApiResponse<{ count: number }>> {
  const response = await apiClient.get<ApiResponse<{ count: number }>>(
    `/notifications/unread-count`,
  );
  return response.data;
}
