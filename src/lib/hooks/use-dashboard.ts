'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getParentDashboard } from '@/lib/api/dashboard';

const dashboardKeys = {
  all: ['dashboard'] as const,
  parent: (schoolId: string) =>
    [...dashboardKeys.all, 'parent', schoolId] as const,
};

export function useParentDashboard() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: dashboardKeys.parent(schoolId!),
    queryFn: () => getParentDashboard(schoolId!),
    enabled: !!schoolId,
  });
}
