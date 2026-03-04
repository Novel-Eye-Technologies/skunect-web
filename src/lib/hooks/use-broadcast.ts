'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getBroadcasts, createBroadcast } from '@/lib/api/broadcast';
import type { CreateBroadcastRequest } from '@/lib/types/broadcast';

export const broadcastKeys = {
  all: ['broadcasts'] as const,
  list: (schoolId: string) => [...broadcastKeys.all, 'list', schoolId] as const,
};

export function useBroadcasts() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useQuery({
    queryKey: broadcastKeys.list(schoolId!),
    queryFn: () => getBroadcasts(schoolId!),
    enabled: !!schoolId,
  });
}

export function useCreateBroadcast() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBroadcastRequest) => createBroadcast(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: broadcastKeys.all });
      toast.success('Broadcast sent successfully');
    },
    onError: () => toast.error('Failed to send broadcast'),
  });
}
