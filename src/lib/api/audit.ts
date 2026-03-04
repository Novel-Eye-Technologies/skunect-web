import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { AuditLog } from '@/lib/types/audit';

export interface AuditLogParams {
  page?: number;
  size?: number;
  entityType?: string;
  action?: string;
}

export async function getAuditLogs(
  schoolId: string,
  params?: AuditLogParams,
): Promise<ApiResponse<AuditLog[]>> {
  const response = await apiClient.get<ApiResponse<AuditLog[]>>(
    `/schools/${schoolId}/audit-logs`,
    { params },
  );
  return response.data;
}
