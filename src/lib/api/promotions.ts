import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  EligibleStudent,
  BulkPromoteRequest,
  PromotionRecord,
} from '@/lib/types/promotion';

export async function getEligibleStudents(
  schoolId: string,
  classId: string,
  sessionId: string,
): Promise<ApiResponse<EligibleStudent[]>> {
  const response = await apiClient.get<ApiResponse<EligibleStudent[]>>(
    `/schools/${schoolId}/promotions/eligible`,
    { params: { classId, sessionId } },
  );
  return response.data;
}

export async function bulkPromote(
  schoolId: string,
  data: BulkPromoteRequest,
): Promise<ApiResponse<PromotionRecord[]>> {
  const response = await apiClient.post<ApiResponse<PromotionRecord[]>>(
    `/schools/${schoolId}/promotions`,
    data,
  );
  return response.data;
}

export async function getPromotionHistory(
  schoolId: string,
  sessionId?: string,
): Promise<ApiResponse<PromotionRecord[]>> {
  const response = await apiClient.get<ApiResponse<PromotionRecord[]>>(
    `/schools/${schoolId}/promotions`,
    sessionId ? { params: { sessionId } } : undefined,
  );
  return response.data;
}
