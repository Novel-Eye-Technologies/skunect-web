import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  TimetableConfig,
  TimetableSlot,
  CreateTimetableSlotRequest,
  TimetableConfigRequest,
} from '@/lib/types/timetable';

export async function getTimetableConfig(
  schoolId: string,
  sessionId: string,
): Promise<ApiResponse<TimetableConfig>> {
  const response = await apiClient.get<ApiResponse<TimetableConfig>>(
    `/schools/${schoolId}/timetable/config`,
    { params: { sessionId } },
  );
  return response.data;
}

export async function saveTimetableConfig(
  schoolId: string,
  data: TimetableConfigRequest,
): Promise<ApiResponse<TimetableConfig>> {
  const response = await apiClient.post<ApiResponse<TimetableConfig>>(
    `/schools/${schoolId}/timetable/config`,
    data,
  );
  return response.data;
}

export async function getTimetableSlots(
  schoolId: string,
  sessionId: string,
  classId?: string,
): Promise<ApiResponse<TimetableSlot[]>> {
  const response = await apiClient.get<ApiResponse<TimetableSlot[]>>(
    `/schools/${schoolId}/timetable/slots`,
    { params: { sessionId, classId } },
  );
  return response.data;
}

export async function createTimetableSlot(
  schoolId: string,
  data: CreateTimetableSlotRequest,
): Promise<ApiResponse<TimetableSlot>> {
  const response = await apiClient.post<ApiResponse<TimetableSlot>>(
    `/schools/${schoolId}/timetable/slots`,
    data,
  );
  return response.data;
}

export async function updateTimetableSlot(
  schoolId: string,
  slotId: string,
  data: CreateTimetableSlotRequest,
): Promise<ApiResponse<TimetableSlot>> {
  const response = await apiClient.put<ApiResponse<TimetableSlot>>(
    `/schools/${schoolId}/timetable/slots/${slotId}`,
    data,
  );
  return response.data;
}

export async function deleteTimetableSlot(
  schoolId: string,
  slotId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/timetable/slots/${slotId}`,
  );
  return response.data;
}
