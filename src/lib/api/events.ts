import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type { EventItem, CreateEventRequest, UpdateEventRequest } from '@/lib/types/event';

export async function getEvents(
  schoolId: string,
  page = 0,
  size = 20,
): Promise<ApiResponse<EventItem[]>> {
  const response = await apiClient.get<ApiResponse<EventItem[]>>(
    `/schools/${schoolId}/events`,
    { params: { page, size } },
  );
  return response.data;
}

export async function getEvent(
  schoolId: string,
  eventId: string,
): Promise<ApiResponse<EventItem>> {
  const response = await apiClient.get<ApiResponse<EventItem>>(
    `/schools/${schoolId}/events/${eventId}`,
  );
  return response.data;
}

export async function createEvent(
  schoolId: string,
  data: CreateEventRequest,
): Promise<ApiResponse<EventItem>> {
  const response = await apiClient.post<ApiResponse<EventItem>>(
    `/schools/${schoolId}/events`,
    data,
  );
  return response.data;
}

export async function updateEvent(
  schoolId: string,
  eventId: string,
  data: UpdateEventRequest,
): Promise<ApiResponse<EventItem>> {
  const response = await apiClient.put<ApiResponse<EventItem>>(
    `/schools/${schoolId}/events/${eventId}`,
    data,
  );
  return response.data;
}

export async function deleteEvent(
  schoolId: string,
  eventId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/events/${eventId}`,
  );
  return response.data;
}
