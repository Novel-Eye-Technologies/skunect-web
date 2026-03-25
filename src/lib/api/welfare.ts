import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { RecordWelfareRequest } from '@/lib/types/welfare';

// ---------------------------------------------------------------------------
// Welfare/Behavior Log API functions
// Backend only supports recording welfare (POST). No GET/list endpoint exists.
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
