'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getParents,
  getParent,
  getParentChildren,
  getStudentParents,
  type ParentListParams,
} from '@/lib/api/parents';

const parentKeys = {
  all: ['parents'] as const,
  list: (schoolId: string, params?: ParentListParams) =>
    [...parentKeys.all, 'list', schoolId, params] as const,
  detail: (schoolId: string, parentId: string) =>
    [...parentKeys.all, 'detail', schoolId, parentId] as const,
  children: (schoolId: string, parentId: string) =>
    [...parentKeys.all, 'children', schoolId, parentId] as const,
  studentParents: (schoolId: string, studentId: string) =>
    [...parentKeys.all, 'studentParents', schoolId, studentId] as const,
};

export function useParents(params?: ParentListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: parentKeys.list(schoolId!, params),
    queryFn: () => getParents(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useParent(parentId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: parentKeys.detail(schoolId!, parentId),
    queryFn: () => getParent(schoolId!, parentId),
    enabled: !!schoolId && !!parentId && parentId !== '_',
  });
}

export function useParentChildren(parentId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: parentKeys.children(schoolId!, parentId),
    queryFn: () => getParentChildren(schoolId!, parentId),
    enabled: !!schoolId && !!parentId && parentId !== '_',
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
