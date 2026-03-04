'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getParents,
  getStudentParents,
  type ParentListParams,
} from '@/lib/api/parents';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const parentKeys = {
  all: ['parents'] as const,
  list: (schoolId: string, params?: ParentListParams) =>
    [...parentKeys.all, 'list', schoolId, params] as const,
  studentParents: (schoolId: string, studentId: string) =>
    [...parentKeys.all, 'studentParents', schoolId, studentId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useParents(params?: ParentListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: parentKeys.list(schoolId!, params),
    queryFn: () => getParents(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useStudentParents(studentId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: parentKeys.studentParents(schoolId!, studentId),
    queryFn: () => getStudentParents(schoolId!, studentId),
    enabled: !!schoolId && !!studentId,
  });
}
