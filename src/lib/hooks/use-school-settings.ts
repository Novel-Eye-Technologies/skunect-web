'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getSchoolSettings,
  updateSchoolSettings,
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  setCurrentSession,
  getTerms,
  createTerm,
  updateTerm,
  deleteTerm,
  setCurrentTerm,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getGradingSystems,
  createGradingSystem,
  updateGradingSystem,
  deleteGradingSystem,
} from '@/lib/api/school-settings';
import type {
  UpdateSchoolSettingsRequest,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateTermRequest,
  UpdateTermRequest,
  CreateClassRequest,
  UpdateClassRequest,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  CreateGradingSystemRequest,
  UpdateGradingSystemRequest,
} from '@/lib/types/school';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const schoolSettingsKeys = {
  all: ['school-settings'] as const,
  settings: (schoolId: string) =>
    [...schoolSettingsKeys.all, 'settings', schoolId] as const,
  sessions: (schoolId: string) =>
    [...schoolSettingsKeys.all, 'sessions', schoolId] as const,
  terms: (schoolId: string, sessionId: string) =>
    [...schoolSettingsKeys.all, 'terms', schoolId, sessionId] as const,
  classes: (schoolId: string) =>
    [...schoolSettingsKeys.all, 'classes', schoolId] as const,
  subjects: (schoolId: string) =>
    [...schoolSettingsKeys.all, 'subjects', schoolId] as const,
  gradingSystems: (schoolId: string) =>
    [...schoolSettingsKeys.all, 'grading-systems', schoolId] as const,
};

// ---------------------------------------------------------------------------
// School Settings
// ---------------------------------------------------------------------------

export function useSchoolSettings() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: schoolSettingsKeys.settings(schoolId!),
    queryFn: () => getSchoolSettings(schoolId!),
    enabled: !!schoolId,
    select: (response) => response.data,
  });
}

export function useUpdateSchoolSettings() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSchoolSettingsRequest) =>
      updateSchoolSettings(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.settings(schoolId!),
      });
      toast.success('School settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update school settings');
    },
  });
}

// ---------------------------------------------------------------------------
// Academic Sessions
// ---------------------------------------------------------------------------

export function useSessions() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: schoolSettingsKeys.sessions(schoolId!),
    queryFn: () => getSessions(schoolId!),
    enabled: !!schoolId,
    select: (response) => response.data,
  });
}

export function useCreateSession() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionRequest) =>
      createSession(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.sessions(schoolId!),
      });
      toast.success('Academic session created successfully');
    },
    onError: () => {
      toast.error('Failed to create academic session');
    },
  });
}

export function useUpdateSession() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: UpdateSessionRequest;
    }) => updateSession(schoolId!, sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.sessions(schoolId!),
      });
      toast.success('Academic session updated successfully');
    },
    onError: () => {
      toast.error('Failed to update academic session');
    },
  });
}

export function useDeleteSession() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(schoolId!, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.sessions(schoolId!),
      });
      toast.success('Academic session deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete academic session');
    },
  });
}

export function useSetCurrentSession() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => setCurrentSession(schoolId!, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.sessions(schoolId!),
      });
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.settings(schoolId!),
      });
      toast.success('Current session updated');
    },
    onError: () => {
      toast.error('Failed to set current session');
    },
  });
}

// ---------------------------------------------------------------------------
// Terms
// ---------------------------------------------------------------------------

export function useTerms(sessionId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: schoolSettingsKeys.terms(schoolId!, sessionId),
    queryFn: () => getTerms(schoolId!, sessionId),
    enabled: !!schoolId && !!sessionId,
    select: (response) => response.data,
  });
}

export function useCreateTerm() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTermRequest) => createTerm(schoolId!, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.terms(schoolId!, variables.sessionId),
      });
      toast.success('Term created successfully');
    },
    onError: () => {
      toast.error('Failed to create term');
    },
  });
}

export function useUpdateTerm() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      termId,
      data,
    }: {
      termId: string;
      data: UpdateTermRequest;
    }) => updateTerm(schoolId!, termId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.terms(
          schoolId!,
          variables.data.sessionId,
        ),
      });
      toast.success('Term updated successfully');
    },
    onError: () => {
      toast.error('Failed to update term');
    },
  });
}

export function useDeleteTerm() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      termId,
    }: {
      termId: string;
      sessionId: string;
    }) => deleteTerm(schoolId!, termId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.terms(schoolId!, variables.sessionId),
      });
      toast.success('Term deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete term');
    },
  });
}

export function useSetCurrentTerm() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      termId,
    }: {
      termId: string;
      sessionId: string;
    }) => setCurrentTerm(schoolId!, termId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.terms(schoolId!, variables.sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.settings(schoolId!),
      });
      toast.success('Current term updated');
    },
    onError: () => {
      toast.error('Failed to set current term');
    },
  });
}

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

export function useClasses() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: schoolSettingsKeys.classes(schoolId!),
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (response) => response.data,
  });
}

export function useCreateClass() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassRequest) => createClass(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.classes(schoolId!),
      });
      toast.success('Class created successfully');
    },
    onError: () => {
      toast.error('Failed to create class');
    },
  });
}

export function useUpdateClass() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classId,
      data,
    }: {
      classId: string;
      data: UpdateClassRequest;
    }) => updateClass(schoolId!, classId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.classes(schoolId!),
      });
      toast.success('Class updated successfully');
    },
    onError: () => {
      toast.error('Failed to update class');
    },
  });
}

export function useDeleteClass() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) => deleteClass(schoolId!, classId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.classes(schoolId!),
      });
      toast.success('Class deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete class');
    },
  });
}

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

export function useSubjects() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: schoolSettingsKeys.subjects(schoolId!),
    queryFn: () => getSubjects(schoolId!),
    enabled: !!schoolId,
    select: (response) => response.data,
  });
}

export function useCreateSubject() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubjectRequest) =>
      createSubject(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.subjects(schoolId!),
      });
      toast.success('Subject created successfully');
    },
    onError: () => {
      toast.error('Failed to create subject');
    },
  });
}

export function useUpdateSubject() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subjectId,
      data,
    }: {
      subjectId: string;
      data: UpdateSubjectRequest;
    }) => updateSubject(schoolId!, subjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.subjects(schoolId!),
      });
      toast.success('Subject updated successfully');
    },
    onError: () => {
      toast.error('Failed to update subject');
    },
  });
}

export function useDeleteSubject() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subjectId: string) => deleteSubject(schoolId!, subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.subjects(schoolId!),
      });
      toast.success('Subject deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete subject');
    },
  });
}

// ---------------------------------------------------------------------------
// Grading Systems
// ---------------------------------------------------------------------------

export function useGradingSystems() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: schoolSettingsKeys.gradingSystems(schoolId!),
    queryFn: () => getGradingSystems(schoolId!),
    enabled: !!schoolId,
    select: (response) => response.data,
  });
}

export function useCreateGradingSystem() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGradingSystemRequest) =>
      createGradingSystem(schoolId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.gradingSystems(schoolId!),
      });
      toast.success('Grading system created successfully');
    },
    onError: () => {
      toast.error('Failed to create grading system');
    },
  });
}

export function useUpdateGradingSystem() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateGradingSystemRequest;
    }) => updateGradingSystem(schoolId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.gradingSystems(schoolId!),
      });
      toast.success('Grading system updated successfully');
    },
    onError: () => {
      toast.error('Failed to update grading system');
    },
  });
}

export function useDeleteGradingSystem() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGradingSystem(schoolId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: schoolSettingsKeys.gradingSystems(schoolId!),
      });
      toast.success('Grading system deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete grading system');
    },
  });
}
