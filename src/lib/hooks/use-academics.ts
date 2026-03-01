'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentScores,
  submitBulkScores,
  getReportCards,
  generateReportCards,
  publishReportCard,
  type AssessmentListParams,
  type ReportCardListParams,
} from '@/lib/api/academics';
import type {
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  BulkScoreRequest,
  GenerateReportCardsRequest,
} from '@/lib/types/academics';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const academicsKeys = {
  all: ['academics'] as const,
  assessments: (schoolId: string, params?: AssessmentListParams) =>
    [...academicsKeys.all, 'assessments', schoolId, params] as const,
  scores: (schoolId: string, assessmentId: string) =>
    [...academicsKeys.all, 'scores', schoolId, assessmentId] as const,
  reportCards: (schoolId: string, params?: ReportCardListParams) =>
    [...academicsKeys.all, 'report-cards', schoolId, params] as const,
};

// ---------------------------------------------------------------------------
// Assessment Queries
// ---------------------------------------------------------------------------

export function useAssessments(params?: AssessmentListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: academicsKeys.assessments(schoolId!, params),
    queryFn: () => getAssessments(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useAssessmentScores(assessmentId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: academicsKeys.scores(schoolId!, assessmentId),
    queryFn: () => getAssessmentScores(schoolId!, assessmentId),
    enabled: !!schoolId && !!assessmentId,
    select: (response) => response.data,
  });
}

// ---------------------------------------------------------------------------
// Assessment Mutations
// ---------------------------------------------------------------------------

export function useCreateAssessment() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssessmentRequest) =>
      createAssessment(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.all });
      toast.success('Assessment created successfully');
    },
    onError: () => {
      toast.error('Failed to create assessment');
    },
  });
}

export function useUpdateAssessment() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: UpdateAssessmentRequest;
    }) => updateAssessment(schoolId!, assessmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.all });
      toast.success('Assessment updated successfully');
    },
    onError: () => {
      toast.error('Failed to update assessment');
    },
  });
}

export function useDeleteAssessment() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assessmentId: string) =>
      deleteAssessment(schoolId!, assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.all });
      toast.success('Assessment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete assessment');
    },
  });
}

// ---------------------------------------------------------------------------
// Score Mutations
// ---------------------------------------------------------------------------

export function useSubmitBulkScores() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      assessmentId,
      data,
    }: {
      assessmentId: string;
      data: BulkScoreRequest;
    }) => submitBulkScores(schoolId!, assessmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.all });
      toast.success('Scores submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit scores');
    },
  });
}

// ---------------------------------------------------------------------------
// Report Card Queries & Mutations
// ---------------------------------------------------------------------------

export function useReportCards(params?: ReportCardListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: academicsKeys.reportCards(schoolId!, params),
    queryFn: () => getReportCards(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useGenerateReportCards() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateReportCardsRequest) =>
      generateReportCards(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.all });
      toast.success('Report cards generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate report cards');
    },
  });
}

export function usePublishReportCard() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportCardId: string) =>
      publishReportCard(schoolId!, reportCardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicsKeys.all });
      toast.success('Report card published successfully');
    },
    onError: () => {
      toast.error('Failed to publish report card');
    },
  });
}
