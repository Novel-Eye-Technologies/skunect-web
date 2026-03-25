import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { RecordWelfareRequest, WelfareRecord } from '@/lib/types/welfare';

// ---------------------------------------------------------------------------
// Welfare/Behavior Log API functions
// ---------------------------------------------------------------------------

export async function recordWelfare(
  schoolId: string,
  data: RecordWelfareRequest,
): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    `/schools/${schoolId}/welfare`,
    data,
  );
  return response.data;
}

export interface WelfareListParams {
  classId?: string;
  date?: string;
  studentId?: string;
}

export async function getWelfareRecords(
  schoolId: string,
  params?: WelfareListParams,
): Promise<ApiResponse<WelfareRecord[]>> {
  const response = await apiClient.get<ApiResponse<WelfareRecord[]>>(
    `/schools/${schoolId}/welfare`,
    { params },
  );
  return response.data;
}
