'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getConversations,
  getMessages,
  createConversation,
  sendMessage,
} from '@/lib/api/messaging';
import type {
  CreateConversationRequest,
  SendMessageRequest,
} from '@/lib/types/messaging';
import type { PaginatedParams } from '@/lib/api/types';
import { queryClient } from '@/lib/query-client';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const messagingKeys = {
  all: ['messaging'] as const,
  conversations: (schoolId: string, params?: PaginatedParams) =>
    [...messagingKeys.all, 'conversations', schoolId, params] as const,
  messages: (schoolId: string, conversationId: string, params?: PaginatedParams) =>
    [...messagingKeys.all, 'messages', schoolId, conversationId, params] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useConversations(params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: messagingKeys.conversations(schoolId ?? '', params),
    queryFn: () => getConversations(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useMessages(conversationId: string, params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: messagingKeys.messages(schoolId ?? '', conversationId, params),
    queryFn: () => getMessages(schoolId!, conversationId, params),
    enabled: !!schoolId && !!conversationId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateConversation() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (data: CreateConversationRequest) =>
      createConversation(schoolId!, data),
    onSuccess: () => {
      toast.success('Conversation started');
      queryClient.invalidateQueries({ queryKey: messagingKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to start conversation'));
    },
  });
}

export function useUnreadMessageCount() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: [...messagingKeys.all, 'unread-count', schoolId ?? ''],
    queryFn: () => getConversations(schoolId!, { page: 0, size: 100 }),
    select: (res) => (res.data ?? []).reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
    enabled: !!schoolId,
    refetchInterval: 30_000,
  });
}

export function useSendMessage() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string;
      data: SendMessageRequest;
    }) => sendMessage(schoolId!, conversationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to send message'));
    },
  });
}
