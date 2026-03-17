'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getBusRoutes,
  createBusRoute,
  deleteBusRoute,
  getBuses,
  createBus,
  deleteBus,
  getBusEnrollments,
  enrollStudent,
  unenrollStudent,
  getBusTrips,
  createBusTrip,
  updateTripStudentStatus,
  getBusTracking,
} from '@/lib/api/bus';
import type {
  CreateBusRouteRequest,
  CreateBusRequest,
  EnrollStudentRequest,
  CreateBusTripRequest,
  UpdateTripStudentRequest,
} from '@/lib/types/bus';
import type { PaginatedParams } from '@/lib/api/types';
import { queryClient } from '@/lib/query-client';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const busKeys = {
  all: ['bus'] as const,
  routes: (schoolId: string, params?: PaginatedParams) =>
    [...busKeys.all, 'routes', schoolId, params] as const,
  buses: (schoolId: string, params?: PaginatedParams) =>
    [...busKeys.all, 'buses', schoolId, params] as const,
  enrollments: (schoolId: string, params?: PaginatedParams) =>
    [...busKeys.all, 'enrollments', schoolId, params] as const,
  trips: (schoolId: string, params?: PaginatedParams) =>
    [...busKeys.all, 'trips', schoolId, params] as const,
  tracking: (schoolId: string, studentId: string) =>
    [...busKeys.all, 'tracking', schoolId, studentId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useBusRoutes(params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: busKeys.routes(schoolId ?? '', params),
    queryFn: () => getBusRoutes(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useBuses(params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: busKeys.buses(schoolId ?? '', params),
    queryFn: () => getBuses(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useBusEnrollments(params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: busKeys.enrollments(schoolId ?? '', params),
    queryFn: () => getBusEnrollments(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useBusTrips(params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: busKeys.trips(schoolId ?? '', params),
    queryFn: () => getBusTrips(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useBusTracking(studentId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: busKeys.tracking(schoolId ?? '', studentId),
    queryFn: () => getBusTracking(schoolId!, studentId),
    enabled: !!schoolId && !!studentId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateBusRoute() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (data: CreateBusRouteRequest) =>
      createBusRoute(schoolId!, data),
    onSuccess: () => {
      toast.success('Bus route created');
      queryClient.invalidateQueries({ queryKey: busKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create bus route'));
    },
  });
}

export function useDeleteBusRoute() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (routeId: string) => deleteBusRoute(schoolId!, routeId),
    onSuccess: () => {
      toast.success('Bus route deleted');
      queryClient.invalidateQueries({ queryKey: busKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete bus route'));
    },
  });
}

export function useCreateBus() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (data: CreateBusRequest) => createBus(schoolId!, data),
    onSuccess: () => {
      toast.success('Bus created');
      queryClient.invalidateQueries({ queryKey: busKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create bus'));
    },
  });
}

export function useDeleteBus() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (busId: string) => deleteBus(schoolId!, busId),
    onSuccess: () => {
      toast.success('Bus deleted');
      queryClient.invalidateQueries({ queryKey: busKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete bus'));
    },
  });
}

export function useEnrollStudent() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (data: EnrollStudentRequest) =>
      enrollStudent(schoolId!, data),
    onSuccess: () => {
      toast.success('Student enrolled on bus');
      queryClient.invalidateQueries({ queryKey: busKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to enroll student'));
    },
  });
}

export function useUnenrollStudent() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (enrollmentId: string) =>
      unenrollStudent(schoolId!, enrollmentId),
    onSuccess: () => {
      toast.success('Student unenrolled from bus');
      queryClient.invalidateQueries({ queryKey: busKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to unenroll student'));
    },
  });
}

export function useCreateBusTrip() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (data: CreateBusTripRequest) =>
      createBusTrip(schoolId!, data),
    onSuccess: () => {
      toast.success('Bus trip created');
      queryClient.invalidateQueries({ queryKey: busKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create bus trip'));
    },
  });
}

export function useUpdateTripStudentStatus() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: ({
      tripId,
      studentId,
      data,
    }: {
      tripId: string;
      studentId: string;
      data: UpdateTripStudentRequest;
    }) => updateTripStudentStatus(schoolId!, tripId, studentId, data),
    onSuccess: () => {
      toast.success('Student trip status updated');
      queryClient.invalidateQueries({ queryKey: busKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update student trip status'));
    },
  });
}
