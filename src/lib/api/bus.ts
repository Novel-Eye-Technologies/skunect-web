import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  BusRoute,
  Bus,
  BusEnrollment,
  BusTrip,
  BusTracking,
  CreateBusRouteRequest,
  CreateBusRequest,
  EnrollStudentRequest,
  CreateBusTripRequest,
  UpdateTripStudentRequest,
} from '@/lib/types/bus';

// ---------------------------------------------------------------------------
// Bus Routes
// ---------------------------------------------------------------------------

export async function getBusRoutes(
  schoolId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<BusRoute[]>> {
  const response = await apiClient.get<ApiResponse<BusRoute[]>>(
    `/schools/${schoolId}/bus/routes`,
    { params },
  );
  return response.data;
}

export async function createBusRoute(
  schoolId: string,
  data: CreateBusRouteRequest,
): Promise<ApiResponse<BusRoute>> {
  const response = await apiClient.post<ApiResponse<BusRoute>>(
    `/schools/${schoolId}/bus/routes`,
    data,
  );
  return response.data;
}

export async function deleteBusRoute(
  schoolId: string,
  routeId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/bus/routes/${routeId}`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Buses
// ---------------------------------------------------------------------------

export async function getBuses(
  schoolId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<Bus[]>> {
  const response = await apiClient.get<ApiResponse<Bus[]>>(
    `/schools/${schoolId}/bus/buses`,
    { params },
  );
  return response.data;
}

export async function createBus(
  schoolId: string,
  data: CreateBusRequest,
): Promise<ApiResponse<Bus>> {
  const response = await apiClient.post<ApiResponse<Bus>>(
    `/schools/${schoolId}/bus/buses`,
    data,
  );
  return response.data;
}

export async function deleteBus(
  schoolId: string,
  busId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/bus/buses/${busId}`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Enrollments
// ---------------------------------------------------------------------------

export async function getBusEnrollments(
  schoolId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<BusEnrollment[]>> {
  const response = await apiClient.get<ApiResponse<BusEnrollment[]>>(
    `/schools/${schoolId}/bus/enrollments`,
    { params },
  );
  return response.data;
}

export async function enrollStudent(
  schoolId: string,
  data: EnrollStudentRequest,
): Promise<ApiResponse<BusEnrollment>> {
  const response = await apiClient.post<ApiResponse<BusEnrollment>>(
    `/schools/${schoolId}/bus/enrollments`,
    data,
  );
  return response.data;
}

export async function unenrollStudent(
  schoolId: string,
  enrollmentId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/bus/enrollments/${enrollmentId}`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Trips
// ---------------------------------------------------------------------------

export async function getBusTrips(
  schoolId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<BusTrip[]>> {
  const response = await apiClient.get<ApiResponse<BusTrip[]>>(
    `/schools/${schoolId}/bus/trips`,
    { params },
  );
  return response.data;
}

export async function createBusTrip(
  schoolId: string,
  data: CreateBusTripRequest,
): Promise<ApiResponse<BusTrip>> {
  const response = await apiClient.post<ApiResponse<BusTrip>>(
    `/schools/${schoolId}/bus/trips`,
    data,
  );
  return response.data;
}

export async function updateTripStudentStatus(
  schoolId: string,
  tripId: string,
  studentId: string,
  data: UpdateTripStudentRequest,
): Promise<ApiResponse<BusTrip>> {
  const response = await apiClient.put<ApiResponse<BusTrip>>(
    `/schools/${schoolId}/bus/trips/${tripId}/students/${studentId}`,
    data,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Parent Tracking
// ---------------------------------------------------------------------------

export async function getBusTracking(
  schoolId: string,
  studentId: string,
): Promise<ApiResponse<BusTracking>> {
  const response = await apiClient.get<ApiResponse<BusTracking>>(
    `/schools/${schoolId}/bus/tracking/${studentId}`,
  );
  return response.data;
}
