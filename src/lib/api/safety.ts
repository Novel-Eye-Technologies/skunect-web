import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  EmergencyAlert,
  CreateEmergencyAlertRequest,
  PickupLog,
  CreatePickupLogRequest,
} from '@/lib/types/safety';

// ---------------------------------------------------------------------------
// Emergency Alerts
// ---------------------------------------------------------------------------

export async function getEmergencyAlerts(
  schoolId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<EmergencyAlert[]>> {
  const response = await apiClient.get<ApiResponse<EmergencyAlert[]>>(
    `/schools/${schoolId}/safety/emergency-alerts`,
    { params },
  );
  return response.data;
}

export async function createEmergencyAlert(
  schoolId: string,
  data: CreateEmergencyAlertRequest,
): Promise<ApiResponse<EmergencyAlert>> {
  const response = await apiClient.post<ApiResponse<EmergencyAlert>>(
    `/schools/${schoolId}/safety/emergency-alerts`,
    data,
  );
  return response.data;
}

export async function resolveEmergencyAlert(
  schoolId: string,
  alertId: string,
): Promise<ApiResponse<EmergencyAlert>> {
  const response = await apiClient.put<ApiResponse<EmergencyAlert>>(
    `/schools/${schoolId}/safety/emergency-alerts/${alertId}/resolve`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Pickup Logs
// ---------------------------------------------------------------------------

export interface PickupLogListParams extends PaginatedParams {
  date?: string;
}

export async function getPickupLogs(
  schoolId: string,
  params?: PickupLogListParams,
): Promise<ApiResponse<PickupLog[]>> {
  const response = await apiClient.get<ApiResponse<PickupLog[]>>(
    `/schools/${schoolId}/safety/pickup-logs`,
    { params },
  );
  return response.data;
}

export async function createPickupLog(
  schoolId: string,
  data: CreatePickupLogRequest,
): Promise<ApiResponse<PickupLog>> {
  const response = await apiClient.post<ApiResponse<PickupLog>>(
    `/schools/${schoolId}/safety/pickup-logs`,
    data,
  );
  return response.data;
}

export async function verifyPickupLog(
  schoolId: string,
  pickupLogId: string,
): Promise<ApiResponse<PickupLog>> {
  const response = await apiClient.post<ApiResponse<PickupLog>>(
    `/schools/${schoolId}/safety/pickup-logs/${pickupLogId}/verify`,
  );
  return response.data;
}
