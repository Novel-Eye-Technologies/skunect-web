'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  linkParent,
  unlinkParent,
  uploadDocument,
  deleteDocument,
  updateProfile,
  type StudentListParams,
  type UpdateProfileRequest,
} from '@/lib/api/students';
import type {
  CreateStudentRequest,
  UpdateStudentRequest,
  LinkParentRequest,
} from '@/lib/types/student';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const studentKeys = {
  all: ['students'] as const,
  list: (schoolId: string, params?: StudentListParams) =>
    [...studentKeys.all, 'list', schoolId, params] as const,
  detail: (schoolId: string, studentId: string) =>
    [...studentKeys.all, 'detail', schoolId, studentId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useStudents(params?: StudentListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: studentKeys.list(schoolId!, params),
    queryFn: () => getStudents(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useStudent(studentId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: studentKeys.detail(schoolId!, studentId),
    queryFn: () => getStudent(schoolId!, studentId),
    enabled: !!schoolId && !!studentId,
    select: (response) => response.data,
  });
}

// ---------------------------------------------------------------------------
// Student mutations
// ---------------------------------------------------------------------------

export function useCreateStudent() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentRequest) => createStudent(schoolId!, data),
    onSuccess: () => {
      toast.success('Student created successfully');
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: () => {
      toast.error('Failed to create student');
    },
  });
}

export function useUpdateStudent() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string;
      data: UpdateStudentRequest;
    }) => updateStudent(schoolId!, studentId, data),
    onSuccess: () => {
      toast.success('Student updated successfully');
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: () => {
      toast.error('Failed to update student');
    },
  });
}

export function useDeleteStudent() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) => deleteStudent(schoolId!, studentId),
    onSuccess: () => {
      toast.success('Student deleted');
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: () => {
      toast.error('Failed to delete student');
    },
  });
}

// ---------------------------------------------------------------------------
// Parent mutations
// ---------------------------------------------------------------------------

export function useLinkParent() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string;
      data: LinkParentRequest;
    }) => linkParent(schoolId!, studentId, data),
    onSuccess: () => {
      toast.success('Parent linked successfully');
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: () => {
      toast.error('Failed to link parent');
    },
  });
}

export function useUnlinkParent() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      parentId,
    }: {
      studentId: string;
      parentId: string;
    }) => unlinkParent(schoolId!, studentId, parentId),
    onSuccess: () => {
      toast.success('Parent unlinked');
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: () => {
      toast.error('Failed to unlink parent');
    },
  });
}

// ---------------------------------------------------------------------------
// Document mutations
// ---------------------------------------------------------------------------

export function useUploadDocument() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      file,
    }: {
      studentId: string;
      file: File;
    }) => uploadDocument(schoolId!, studentId, file),
    onSuccess: () => {
      toast.success('Document uploaded');
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: () => {
      toast.error('Failed to upload document');
    },
  });
}

export function useDeleteDocument() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      documentId,
    }: {
      studentId: string;
      documentId: string;
    }) => deleteDocument(schoolId!, studentId, documentId),
    onSuccess: () => {
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: () => {
      toast.error('Failed to delete document');
    },
  });
}

// ---------------------------------------------------------------------------
// Profile mutation
// ---------------------------------------------------------------------------

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });
}
