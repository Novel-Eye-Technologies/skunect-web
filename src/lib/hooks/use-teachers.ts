'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getTeachers,
  type TeacherListParams,
} from '@/lib/api/teachers';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const teacherKeys = {
  all: ['teachers'] as const,
  list: (schoolId: string, params?: TeacherListParams) =>
    [...teacherKeys.all, 'list', schoolId, params] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useTeachers(params?: TeacherListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: teacherKeys.list(schoolId!, params),
    queryFn: () => getTeachers(schoolId!, params),
    enabled: !!schoolId,
  });
}
