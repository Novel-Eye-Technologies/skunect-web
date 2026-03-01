'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  type AnnouncementListParams,
} from '@/lib/api/announcements';
import type {
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '@/lib/types/announcements';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const announcementKeys = {
  all: ['announcements'] as const,
  list: (schoolId: string, params?: AnnouncementListParams) =>
    [...announcementKeys.all, 'list', schoolId, params] as const,
  detail: (schoolId: string, announcementId: string) =>
    [...announcementKeys.all, 'detail', schoolId, announcementId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useAnnouncements(params?: AnnouncementListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: announcementKeys.list(schoolId!, params),
    queryFn: () => getAnnouncements(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useAnnouncement(announcementId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: announcementKeys.detail(schoolId!, announcementId),
    queryFn: () => getAnnouncement(schoolId!, announcementId),
    enabled: !!schoolId && !!announcementId,
    select: (response) => response.data,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateAnnouncement() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementRequest) =>
      createAnnouncement(schoolId!, data),
    onSuccess: () => {
      toast.success('Announcement created successfully');
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
    onError: () => {
      toast.error('Failed to create announcement');
    },
  });
}

export function useUpdateAnnouncement() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      announcementId,
      data,
    }: {
      announcementId: string;
      data: UpdateAnnouncementRequest;
    }) => updateAnnouncement(schoolId!, announcementId, data),
    onSuccess: () => {
      toast.success('Announcement updated successfully');
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
    onError: () => {
      toast.error('Failed to update announcement');
    },
  });
}

export function useDeleteAnnouncement() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) =>
      deleteAnnouncement(schoolId!, announcementId),
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
    onError: () => {
      toast.error('Failed to delete announcement');
    },
  });
}

export function usePublishAnnouncement() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) =>
      publishAnnouncement(schoolId!, announcementId),
    onSuccess: () => {
      toast.success('Announcement published');
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
    onError: () => {
      toast.error('Failed to publish announcement');
    },
  });
}

export function useUnpublishAnnouncement() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (announcementId: string) =>
      unpublishAnnouncement(schoolId!, announcementId),
    onSuccess: () => {
      toast.success('Announcement unpublished');
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
    onError: () => {
      toast.error('Failed to unpublish announcement');
    },
  });
}
