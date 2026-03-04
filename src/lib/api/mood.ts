import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { MoodEntry, CreateMoodEntryRequest } from '@/lib/types/mood';

export interface MoodListParams {
  studentId?: string;
  page?: number;
  size?: number;
}

export async function getMoodEntries(
  schoolId: string,
  params?: MoodListParams,
): Promise<ApiResponse<MoodEntry[]>> {
  const response = await apiClient.get<ApiResponse<MoodEntry[]>>(
    `/schools/${schoolId}/mood`,
    { params },
  );
  return response.data;
}

export async function getStudentMoodEntries(
  schoolId: string,
  studentId: string,
  params?: { page?: number; size?: number },
): Promise<ApiResponse<MoodEntry[]>> {
  const response = await apiClient.get<ApiResponse<MoodEntry[]>>(
    `/schools/${schoolId}/mood/students/${studentId}`,
    { params },
  );
  return response.data;
}

export async function createMoodEntry(
  schoolId: string,
  data: CreateMoodEntryRequest,
): Promise<ApiResponse<MoodEntry>> {
  const response = await apiClient.post<ApiResponse<MoodEntry>>(
    `/schools/${schoolId}/mood`,
    data,
  );
  return response.data;
}
