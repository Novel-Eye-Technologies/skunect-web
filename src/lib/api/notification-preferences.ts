import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  NotificationPreference,
  UpdatePreferenceRequest,
} from '@/lib/types/notification-preference';

// ---------------------------------------------------------------------------
// Notification Preferences API functions
// ---------------------------------------------------------------------------

export async function getNotificationPreferences(): Promise<
  ApiResponse<NotificationPreference[]>
> {
  const response = await apiClient.get<ApiResponse<NotificationPreference[]>>(
    '/notifications/preferences',
  );
  return response.data;
}

export async function updateNotificationPreference(
  data: UpdatePreferenceRequest,
): Promise<ApiResponse<NotificationPreference>> {
  const response = await apiClient.put<ApiResponse<NotificationPreference>>(
    '/notifications/preferences',
    data,
  );
  return response.data;
}

export async function getUnreadCount(): Promise<ApiResponse<number>> {
  const response = await apiClient.get<ApiResponse<number>>(
    '/notifications/unread-count',
  );
  return response.data;
}
