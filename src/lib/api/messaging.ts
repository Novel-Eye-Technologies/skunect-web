import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
} from '@/lib/types/messaging';

// ---------------------------------------------------------------------------
// Messaging API functions
// ---------------------------------------------------------------------------

export async function getConversations(
  schoolId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<Conversation[]>> {
  const response = await apiClient.get<ApiResponse<Conversation[]>>(
    `/messaging/conversations`,
    { params },
  );
  return response.data;
}

export async function createConversation(
  schoolId: string,
  data: CreateConversationRequest,
): Promise<ApiResponse<Conversation>> {
  const response = await apiClient.post<ApiResponse<Conversation>>(
    `/messaging/conversations`,
    data,
  );
  return response.data;
}

export async function getMessages(
  schoolId: string,
  conversationId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<Message[]>> {
  const response = await apiClient.get<ApiResponse<Message[]>>(
    `/messaging/conversations/${conversationId}/messages`,
    { params },
  );
  return response.data;
}

export async function sendMessage(
  schoolId: string,
  conversationId: string,
  data: SendMessageRequest,
): Promise<ApiResponse<Message>> {
  const response = await apiClient.post<ApiResponse<Message>>(
    `/messaging/conversations/${conversationId}/messages`,
    data,
  );
  return response.data;
}
