'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getAdminDashboard,
  getAttendanceSummary,
  getFeeSummary,
  getTeacherDashboard,
  getParentDashboard,
} from '@/lib/api/dashboard';

const dashboardKeys = {
  all: ['dashboard'] as const,
  admin: (schoolId: string) =>
    [...dashboardKeys.all, 'admin', schoolId] as const,
  adminAttendance: (schoolId: string, from: string, to: string) =>
    [...dashboardKeys.all, 'admin-attendance', schoolId, from, to] as const,
  adminFees: (schoolId: string) =>
    [...dashboardKeys.all, 'admin-fees', schoolId] as const,
  teacher: (schoolId: string) =>
    [...dashboardKeys.all, 'teacher', schoolId] as const,
  parent: (schoolId: string) =>
    [...dashboardKeys.all, 'parent', schoolId] as const,
};

export function useAdminDashboard() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: dashboardKeys.admin(schoolId!),
    queryFn: () => getAdminDashboard(schoolId!),
    enabled: !!schoolId,
  });
}

export function useAttendanceSummary(from: string, to: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: dashboardKeys.adminAttendance(schoolId!, from, to),
    queryFn: () => getAttendanceSummary(schoolId!, from, to),
    enabled: !!schoolId,
  });
}

export function useFeeSummary() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: dashboardKeys.adminFees(schoolId!),
    queryFn: () => getFeeSummary(schoolId!),
    enabled: !!schoolId,
  });
}

export function useTeacherDashboard() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: dashboardKeys.teacher(schoolId!),
    queryFn: () => getTeacherDashboard(schoolId!),
    enabled: !!schoolId,
  });
}

export function useParentDashboard(studentId?: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: [...dashboardKeys.parent(schoolId!), studentId].filter(Boolean),
    queryFn: () => getParentDashboard(schoolId!, studentId),
    enabled: !!schoolId,
  });
}
