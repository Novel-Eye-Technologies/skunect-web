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
  schoolId: string,
  params?: NotificationListParams,
): Promise<ApiResponse<NotificationItem[]>> {
  const response = await apiClient.get<ApiResponse<NotificationItem[]>>(
    `/schools/${schoolId}/notifications`,
    { params },
  );
  return response.data;
}

export async function markNotificationAsRead(
  schoolId: string,
  notificationId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.put<ApiResponse<null>>(
    `/schools/${schoolId}/notifications/${notificationId}/read`,
  );
  return response.data;
}

export async function markAllNotificationsAsRead(
  schoolId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.put<ApiResponse<null>>(
    `/schools/${schoolId}/notifications/read-all`,
  );
  return response.data;
}

export async function getUnreadCount(
  schoolId: string,
): Promise<ApiResponse<{ count: number }>> {
  const response = await apiClient.get<ApiResponse<{ count: number }>>(
    `/schools/${schoolId}/notifications/unread-count`,
  );
  return response.data;
}
