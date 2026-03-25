'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import { useNotificationStore } from '@/lib/stores/notification-store';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  type NotificationListParams,
} from '@/lib/api/notifications';
import { queryClient } from '@/lib/query-client';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const notificationKeys = {
  all: ['notifications'] as const,
  list: (schoolId: string, params?: NotificationListParams) =>
    [...notificationKeys.all, 'list', schoolId, params] as const,
  unreadCount: (schoolId: string) =>
    [...notificationKeys.all, 'unreadCount', schoolId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useNotifications(params?: NotificationListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: notificationKeys.list(schoolId ?? '', params),
    queryFn: () => getNotifications(params),
    enabled: !!schoolId,
  });
}

export function useUnreadCount() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  return useQuery({
    queryKey: notificationKeys.unreadCount(schoolId ?? ''),
    queryFn: async () => {
      const response = await getUnreadCount();
      setUnreadCount(response.data.count);
      return response;
    },
    enabled: !!schoolId,
    refetchInterval: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useMarkAsRead() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
const decrementUnread = useNotificationStore((s) => s.decrementUnread);

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      decrementUnread();
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to mark notification as read'));
    },
  });
}

export function useMarkAllAsRead() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      setUnreadCount(0);
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to mark all as read'));
    },
  });
}
