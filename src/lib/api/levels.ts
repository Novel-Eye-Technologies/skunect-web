import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  Level,
  CreateLevelRequest,
  UpdateLevelRequest,
  MoveClassesRequest,
} from '@/lib/types/levels';

// ---------------------------------------------------------------------------
// Levels (SCRUM-63)
// ---------------------------------------------------------------------------

export async function getLevels(
  schoolId: string,
): Promise<ApiResponse<Level[]>> {
  const response = await apiClient.get<ApiResponse<Level[]>>(
    `/schools/${schoolId}/levels`,
  );
  return response.data;
}

export async function createLevel(
  schoolId: string,
  data: CreateLevelRequest,
): Promise<ApiResponse<Level>> {
  const response = await apiClient.post<ApiResponse<Level>>(
    `/schools/${schoolId}/levels`,
    data,
  );
  return response.data;
}

export async function updateLevel(
  schoolId: string,
  levelId: string,
  data: UpdateLevelRequest,
): Promise<ApiResponse<Level>> {
  const response = await apiClient.put<ApiResponse<Level>>(
    `/schools/${schoolId}/levels/${levelId}`,
    data,
  );
  return response.data;
}

export async function deleteLevel(
  schoolId: string,
  levelId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/levels/${levelId}`,
  );
  return response.data;
}

/**
 * Atomically move one or more classes from this level to another. Used to drain
 * a level before deletion (the backend blocks DELETE while classes still reference
 * the level).
 */
export async function moveClassesBetweenLevels(
  schoolId: string,
  sourceLevelId: string,
  data: MoveClassesRequest,
): Promise<ApiResponse<{ movedClassIds: string[]; count: number }>> {
  const response = await apiClient.post<
    ApiResponse<{ movedClassIds: string[]; count: number }>
  >(`/schools/${schoolId}/levels/${sourceLevelId}/move-classes`, data);
  return response.data;
}
