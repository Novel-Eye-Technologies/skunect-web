'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getAuditLogs, type AuditLogParams } from '@/lib/api/audit';

export const auditKeys = {
  all: ['audit'] as const,
  list: (schoolId: string, params?: AuditLogParams) =>
    [...auditKeys.all, 'list', schoolId, params] as const,
};

export function useAuditLogs(params?: AuditLogParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useQuery({
    queryKey: auditKeys.list(schoolId!, params),
    queryFn: () => getAuditLogs(schoolId!, params),
    enabled: !!schoolId,
  });
}
