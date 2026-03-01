export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage: MessagePreview | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar: string | null;
}

export interface MessagePreview {
  content: string;
  senderId: string;
  senderName: string;
  sentAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  sentAt: string;
  readAt: string | null;
}

export interface CreateConversationRequest {
  recipientId: string;
  message: string;
}

export interface SendMessageRequest {
  content: string;
}
