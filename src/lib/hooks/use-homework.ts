'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getHomeworkList,
  getHomework,
  createHomework,
  updateHomework,
  deleteHomework,
  getSubmissions,
  gradeSubmission,
  getChildHomework,
  getChildSubmission,
  submitHomeworkForChild,
  type HomeworkListParams,
} from '@/lib/api/homework';
import type {
  CreateHomeworkRequest,
  UpdateHomeworkRequest,
  GradeSubmissionRequest,
} from '@/lib/types/homework';
import type { PaginatedParams } from '@/lib/api/types';
import { queryClient } from '@/lib/query-client';

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
  childHomework: (studentId: string) =>
    [...homeworkKeys.all, 'childHomework', studentId] as const,
  childSubmission: (studentId: string, homeworkId: string) =>
    [...homeworkKeys.all, 'childSubmission', studentId, homeworkId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useHomeworkList(params?: HomeworkListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: homeworkKeys.list(schoolId ?? '', params),
    queryFn: () => getHomeworkList(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useHomework(homeworkId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: homeworkKeys.detail(schoolId ?? '', homeworkId),
    queryFn: () => getHomework(schoolId!, homeworkId),
    enabled: !!schoolId && !!homeworkId,
    select: (response) => response.data,
  });
}

export function useSubmissions(homeworkId: string, params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const currentRole = useAuthStore((s) => s.currentRole);

  return useQuery({
    queryKey: homeworkKeys.submissions(schoolId ?? '', homeworkId, params),
    queryFn: () => getSubmissions(schoolId!, homeworkId, params),
    enabled: !!schoolId && !!homeworkId && currentRole !== 'PARENT',
  });
}

export function useChildHomework(studentId: string | null) {
  return useQuery({
    queryKey: homeworkKeys.childHomework(studentId ?? ''),
    queryFn: () => getChildHomework(studentId!),
    enabled: !!studentId,
  });
}

export function useChildSubmission(studentId: string | null, homeworkId: string) {
  return useQuery({
    queryKey: homeworkKeys.childSubmission(studentId ?? '', homeworkId),
    queryFn: () => getChildSubmission(studentId!, homeworkId),
    enabled: !!studentId && !!homeworkId,
    select: (response) => response.data,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateHomework() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
return useMutation({
    mutationFn: ({
      data,
    }: {
      data: CreateHomeworkRequest;
    }) => createHomework(schoolId!, data),
    onSuccess: () => {
      toast.success('Homework created successfully');
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create homework'));
    },
  });
}

export function useUpdateHomework() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
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
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update homework'));
    },
  });
}

export function useDeleteHomework() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
return useMutation({
    mutationFn: (homeworkId: string) => deleteHomework(schoolId!, homeworkId),
    onSuccess: () => {
      toast.success('Homework deleted');
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete homework'));
    },
  });
}

export function useGradeSubmission() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
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
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to grade submission'));
    },
  });
}

export function useSubmitHomework() {
  return useMutation({
    mutationFn: (data: { studentId: string; homeworkId: string; attachmentUrls?: string[]; notes?: string }) =>
      submitHomeworkForChild(data.studentId, data.homeworkId, {
        attachmentUrls: data.attachmentUrls,
        notes: data.notes,
      }),
    onSuccess: () => {
      toast.success('Homework submitted successfully');
      queryClient.invalidateQueries({ queryKey: homeworkKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to submit homework'));
    },
  });
}
