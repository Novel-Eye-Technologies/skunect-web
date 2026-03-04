'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getActivityFeed } from '@/lib/api/activity';

const activityKeys = {
  all: ['activity'] as const,
  list: (schoolId: string, limit: number) =>
    [...activityKeys.all, 'list', schoolId, limit] as const,
};

export function useActivityFeed(limit: number = 20) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: activityKeys.list(schoolId!, limit),
    queryFn: () => getActivityFeed(schoolId!, limit),
    enabled: !!schoolId,
  });
}
