'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getTeachers,
  getTeacher,
  getTeacherSubjects,
  type TeacherListParams,
} from '@/lib/api/teachers';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const teacherKeys = {
  all: ['teachers'] as const,
  list: (schoolId: string, params?: TeacherListParams) =>
    [...teacherKeys.all, 'list', schoolId, params] as const,
  detail: (schoolId: string, teacherId: string) =>
    [...teacherKeys.all, 'detail', schoolId, teacherId] as const,
  subjects: (schoolId: string, teacherId: string) =>
    [...teacherKeys.all, 'subjects', schoolId, teacherId] as const,
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

export function useTeacher(teacherId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: teacherKeys.detail(schoolId!, teacherId),
    queryFn: () => getTeacher(schoolId!, teacherId),
    enabled: !!schoolId && !!teacherId && teacherId !== '_',
  });
}

export function useTeacherSubjects(teacherId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: teacherKeys.subjects(schoolId!, teacherId),
    queryFn: () => getTeacherSubjects(schoolId!, teacherId),
    enabled: !!schoolId && !!teacherId && teacherId !== '_',
    select: (response) => response.data,
  });
}
