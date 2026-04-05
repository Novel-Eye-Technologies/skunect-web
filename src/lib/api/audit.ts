import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { AuditLog } from '@/lib/types/audit';

export interface AuditLogParams {
  page?: number;
  size?: number;
  entityType?: string;
  action?: string;
  search?: string;
}

interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export async function getAuditLogs(
  schoolId: string,
  params?: AuditLogParams,
): Promise<ApiResponse<AuditLog[]>> {
  const response = await apiClient.get<ApiResponse<SpringPage<AuditLog>>>(
    `/schools/${schoolId}/audit-logs`,
    { params },
  );
  const raw = response.data;
  const page = raw.data;
  return {
    ...raw,
    data: page?.content ?? [],
    meta: page
      ? {
          page: page.number,
          size: page.size,
          totalElements: page.totalElements,
          totalPages: page.totalPages,
        }
      : null,
  };
}
