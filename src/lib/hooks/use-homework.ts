'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getHomeworkList,
  getHomework,
  createHomework,
  updateHomework,
  deleteHomework,
  getSubmissions,
  gradeSubmission,
  type HomeworkListParams,
} from '@/lib/api/homework';
import type {
  CreateHomeworkRequest,
  UpdateHomeworkRequest,
  GradeSubmissionRequest,
} from '@/lib/types/homework';
import type { PaginatedParams } from '@/lib/api/types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const homeworkKeys = {
  all: ['homework'] as const,
  list: (schoolId: string, params?: HomeworkListParams) =>
    [...homeworkKeys.all, 'list', schoolId, params] as const,
  detail: (schoolId: string, homeworkId: string) =>
    [...homeworkKeys.all, 'detail', schoolId, homeworkId] as const,
  submissions: (schoolId: string, homeworkId: string, params?: PaginatedParams) =>
    [...homeworkKeys.all, 'submissions', schoolId, homeworkId, params] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useHomeworkList(params?: HomeworkListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: homeworkKeys.list(schoolId!, params),
    queryFn: () => getHomeworkList(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useHomework(homeworkId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: homeworkKeys.detail(schoolId!, homeworkId),
    queryFn: () => getHomework(schoolId!, homeworkId),
    enabled: !!schoolId && !!homeworkId,
    select: (response) => response.data,
  });
}

export function useSubmissions(homeworkId: string, params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: homeworkKeys.submissions(schoolId!, homeworkId, params),
    queryFn: () => getSubmissions(schoolId!, homeworkId, params),
    enabled: !!schoolId && !!homeworkId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateHomework() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: CreateHomeworkRequest;
      files?: File[];
    }) => createHomework(schoolId!, data, files),
    onSuccess: () => {
      toast.success('Homework created successfully');
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
    },
    onError: () => {
      toast.error('Failed to create homework');
    },
  });
}

export function useUpdateHomework() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      homeworkId,
      data,
    }: {
      homeworkId: string;
      data: UpdateHomeworkRequest;
    }) => updateHomework(schoolId!, homeworkId, data),
    onSuccess: () => {
      toast.success('Homework updated successfully');
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
    },
    onError: () => {
      toast.error('Failed to update homework');
    },
  });
}

export function useDeleteHomework() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (homeworkId: string) => deleteHomework(schoolId!, homeworkId),
    onSuccess: () => {
      toast.success('Homework deleted');
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
    },
    onError: () => {
      toast.error('Failed to delete homework');
    },
  });
}

export function useGradeSubmission() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      homeworkId,
      submissionId,
      data,
    }: {
      homeworkId: string;
      submissionId: string;
      data: GradeSubmissionRequest;
    }) => gradeSubmission(schoolId!, homeworkId, submissionId, data),
    onSuccess: () => {
      toast.success('Submission graded successfully');
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
    },
    onError: () => {
      toast.error('Failed to grade submission');
    },
  });
}
