'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getNotificationPreferences,
  updateNotificationPreference,
  getUnreadCount,
} from '@/lib/api/notification-preferences';
import type { UpdatePreferenceRequest } from '@/lib/types/notification-preference';
import { queryClient } from '@/lib/query-client';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const prefKeys = {
  all: ['notification-preferences'] as const,
  list: () => [...prefKeys.all, 'list'] as const,
  unreadCount: () => ['notifications', 'unread-count'] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useNotificationPreferences() {
  return useQuery({
    queryKey: prefKeys.list(),
    queryFn: getNotificationPreferences,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: prefKeys.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useUpdateNotificationPreference() {
return useMutation({
    mutationFn: (data: UpdatePreferenceRequest) =>
      updateNotificationPreference(data),
    onSuccess: () => {
      toast.success('Preference updated');
      queryClient.invalidateQueries({ queryKey: prefKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update preference'));
    },
  });
}
