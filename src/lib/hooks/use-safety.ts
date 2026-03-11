'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getEmergencyAlerts,
  createEmergencyAlert,
  resolveEmergencyAlert,
  getPickupLogs,
  createPickupLog,
  verifyPickupLog,
  getPickupAuthorizations,
  createPickupAuthorization,
  revokePickupAuthorization,
  type PickupLogListParams,
} from '@/lib/api/safety';
import type {
  CreateEmergencyAlertRequest,
  CreatePickupLogRequest,
  CreatePickupAuthorizationRequest,
} from '@/lib/types/safety';
import type { PaginatedParams } from '@/lib/api/types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const safetyKeys = {
  all: ['safety'] as const,
  alerts: (schoolId: string, params?: PaginatedParams) =>
    [...safetyKeys.all, 'alerts', schoolId, params] as const,
  pickupLogs: (schoolId: string, params?: PickupLogListParams) =>
    [...safetyKeys.all, 'pickup-logs', schoolId, params] as const,
  pickupAuthorizations: (schoolId: string, studentId?: string) =>
    [...safetyKeys.all, 'pickup-authorizations', schoolId, studentId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useEmergencyAlerts(params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: safetyKeys.alerts(schoolId!, params),
    queryFn: () => getEmergencyAlerts(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function usePickupLogs(params?: PickupLogListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: safetyKeys.pickupLogs(schoolId!, params),
    queryFn: () => getPickupLogs(schoolId!, params),
    enabled: !!schoolId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateEmergencyAlert() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmergencyAlertRequest) =>
      createEmergencyAlert(schoolId!, data),
    onSuccess: () => {
      toast.success('Emergency alert created');
      queryClient.invalidateQueries({ queryKey: safetyKeys.all });
    },
    onError: () => {
      toast.error('Failed to create emergency alert');
    },
  });
}

export function useResolveEmergencyAlert() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) =>
      resolveEmergencyAlert(schoolId!, alertId),
    onSuccess: () => {
      toast.success('Alert resolved');
      queryClient.invalidateQueries({ queryKey: safetyKeys.all });
    },
    onError: () => {
      toast.error('Failed to resolve alert');
    },
  });
}

export function useCreatePickupLog() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePickupLogRequest) =>
      createPickupLog(schoolId!, data),
    onSuccess: () => {
      toast.success('Pickup log created');
      queryClient.invalidateQueries({ queryKey: safetyKeys.all });
    },
    onError: () => {
      toast.error('Failed to create pickup log');
    },
  });
}

export function useVerifyPickupLog() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pickupLogId: string) =>
      verifyPickupLog(schoolId!, pickupLogId),
    onSuccess: () => {
      toast.success('Pickup verified');
      queryClient.invalidateQueries({ queryKey: safetyKeys.all });
    },
    onError: () => {
      toast.error('Failed to verify pickup');
    },
  });
}

// ---------------------------------------------------------------------------
// Pickup Authorization Queries & Mutations
// ---------------------------------------------------------------------------

export function usePickupAuthorizations(studentId?: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: safetyKeys.pickupAuthorizations(schoolId!, studentId),
    queryFn: () =>
      getPickupAuthorizations(schoolId!, {
        studentId: studentId || undefined,
      }),
    enabled: !!schoolId,
  });
}

export function useCreatePickupAuthorization() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePickupAuthorizationRequest) =>
      createPickupAuthorization(schoolId!, data),
    onSuccess: () => {
      toast.success('Pickup authorization created');
      queryClient.invalidateQueries({ queryKey: safetyKeys.all });
    },
    onError: () => {
      toast.error('Failed to create pickup authorization');
    },
  });
}

export function useRevokePickupAuthorization() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (authorizationId: string) =>
      revokePickupAuthorization(schoolId!, authorizationId),
    onSuccess: () => {
      toast.success('Pickup authorization revoked');
      queryClient.invalidateQueries({ queryKey: safetyKeys.all });
    },
    onError: () => {
      toast.error('Failed to revoke pickup authorization');
    },
  });
}
