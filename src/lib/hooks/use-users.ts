'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getUsers,
  inviteUser,
  updateSchoolUser,
  removeUser,
  type UserListParams,
} from '@/lib/api/users';
import type { InviteUserRequest, UpdateSchoolUserRequest } from '@/lib/types/user';
import { queryClient } from '@/lib/query-client';

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
    queryKey: userKeys.list(schoolId ?? '', params),
    queryFn: () => getUsers(schoolId!, params),
    enabled: !!schoolId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useInviteUser() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
return useMutation({
    mutationFn: (data: InviteUserRequest) => inviteUser(schoolId!, data),
    onSuccess: () => {
      toast.success('User invited successfully');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to invite user'));
    },
  });
}

export function useUpdateSchoolUser() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateSchoolUserRequest;
    }) => updateSchoolUser(schoolId!, userId, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update user'));
    },
  });
}

export function useRemoveUser() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
return useMutation({
    mutationFn: (userId: string) => removeUser(schoolId!, userId),
    onSuccess: () => {
      toast.success('User removed from school');
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove user'));
    },
  });
}
