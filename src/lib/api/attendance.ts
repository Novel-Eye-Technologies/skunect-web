import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  AttendanceRecord,
  BulkAttendanceRequest,
  AttendanceSummaryResponse,
} from '@/lib/types/attendance';

// ---------------------------------------------------------------------------
// Params
// ---------------------------------------------------------------------------

export interface AttendanceListParams extends PaginatedParams {
  classId?: string;
  date?: string;
}

export interface AttendanceSummaryParams {
  classId: string;
  startDate: string;
  endDate: string;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getAttendanceRecords(
  schoolId: string,
  params?: AttendanceListParams,
): Promise<ApiResponse<AttendanceRecord[]>> {
  const response = await apiClient.get<ApiResponse<AttendanceRecord[]>>(
    `/schools/${schoolId}/attendance`,
    { params },
  );
  return response.data;
}

export async function submitBulkAttendance(
  schoolId: string,
  data: BulkAttendanceRequest,
): Promise<ApiResponse<void>> {
  const response = await apiClient.post<ApiResponse<void>>(
    `/schools/${schoolId}/attendance`,
    data,
  );
  return response.data;
}

export async function getAttendanceSummary(
  schoolId: string,
  params: AttendanceSummaryParams,
): Promise<ApiResponse<AttendanceSummaryResponse>> {
  const response = await apiClient.get<ApiResponse<AttendanceSummaryResponse>>(
    `/schools/${schoolId}/attendance/summary`,
    { params },
  );
  return response.data;
}
