import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '@/lib/types/announcements';

// ---------------------------------------------------------------------------
// Announcement API functions
// ---------------------------------------------------------------------------

export interface AnnouncementListParams extends PaginatedParams {
  published?: boolean;
}

export async function getAnnouncements(
  schoolId: string,
  params?: AnnouncementListParams,
): Promise<ApiResponse<Announcement[]>> {
  const response = await apiClient.get<ApiResponse<Announcement[]>>(
    `/schools/${schoolId}/announcements`,
    { params },
  );
  return response.data;
}

export async function getAnnouncement(
  schoolId: string,
  announcementId: string,
): Promise<ApiResponse<Announcement>> {
  const response = await apiClient.get<ApiResponse<Announcement>>(
    `/schools/${schoolId}/announcements/${announcementId}`,
  );
  return response.data;
}

export async function createAnnouncement(
  schoolId: string,
  data: CreateAnnouncementRequest,
): Promise<ApiResponse<Announcement>> {
  const response = await apiClient.post<ApiResponse<Announcement>>(
    `/schools/${schoolId}/announcements`,
    data,
  );
  return response.data;
}

export async function updateAnnouncement(
  schoolId: string,
  announcementId: string,
  data: UpdateAnnouncementRequest,
): Promise<ApiResponse<Announcement>> {
  const response = await apiClient.put<ApiResponse<Announcement>>(
    `/schools/${schoolId}/announcements/${announcementId}`,
    data,
  );
  return response.data;
}

export async function deleteAnnouncement(
  schoolId: string,
  announcementId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/schools/${schoolId}/announcements/${announcementId}`,
  );
  return response.data;
}

export async function publishAnnouncement(
  schoolId: string,
  announcementId: string,
): Promise<ApiResponse<Announcement>> {
  const response = await apiClient.put<ApiResponse<Announcement>>(
    `/schools/${schoolId}/announcements/${announcementId}/publish`,
  );
  return response.data;
}

export async function unpublishAnnouncement(
  schoolId: string,
  announcementId: string,
): Promise<ApiResponse<Announcement>> {
  const response = await apiClient.put<ApiResponse<Announcement>>(
    `/schools/${schoolId}/announcements/${announcementId}/unpublish`,
  );
  return response.data;
}
