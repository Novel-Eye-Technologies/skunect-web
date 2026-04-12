import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  EligibleStudent,
  BulkPromoteRequest,
  PromoteLevelRequest,
  PromoteLevelResponse,
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

/**
 * SCRUM-63 PR 6: Bulk-promote every active student in a level to the matching
 * destination class in another level. Source classes are auto-mapped to destination
 * classes by suffix (JSS 1A → JSS 2A by trailing "A"). Students whose source class
 * has no suffix-matched destination are returned in the response's `unmatched` list.
 */
export async function promoteLevel(
  schoolId: string,
  data: PromoteLevelRequest,
): Promise<ApiResponse<PromoteLevelResponse>> {
  const response = await apiClient.post<ApiResponse<PromoteLevelResponse>>(
    `/schools/${schoolId}/promotions/level`,
    data,
  );
  return response.data;
}
