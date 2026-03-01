'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getUsers,
  inviteUser,
  updateUserStatus,
  removeUser,
  type UserListParams,
} from '@/lib/api/users';
import type { InviteUserRequest, UpdateUserStatusRequest } from '@/lib/types/user';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const userKeys = {
  all: ['users'] as const,
  list: (schoolId: string, params?: UserListParams) =>
    [...userKeys.all, 'list', schoolId, params] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useUsers(params?: UserListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: userKeys.list(schoolId!, params),
    queryFn: () => getUsers(schoolId!, params),
    enabled: !!schoolId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useInviteUser() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteUserRequest) => inviteUser(schoolId!, data),
    onSuccess: () => {
      toast.success('User invited successfully');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: () => {
      toast.error('Failed to invite user');
    },
  });
}

export function useUpdateUserStatus() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUserStatusRequest;
    }) => updateUserStatus(schoolId!, userId, data),
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: () => {
      toast.error('Failed to update user status');
    },
  });
}

export function useRemoveUser() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeUser(schoolId!, userId),
    onSuccess: () => {
      toast.success('User removed from school');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: () => {
      toast.error('Failed to remove user');
    },
  });
}
