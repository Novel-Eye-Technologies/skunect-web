import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type SendMessageRequest = Api['SendMessageRequest'];
export type CreateConversationRequest = Api['CreateConversationRequest'];

// Response types from generated OpenAPI schemas
export type Conversation = Api['ConversationResponse'];
export type ConversationParticipant = Api['ParticipantInfo'];
// MessageResponse is `{...} | null` in generated types (nullable for lastMessage field).
// Strip null for standalone message usage.
export type Message = NonNullable<Api['MessageResponse']>;
export type MessagePreview = NonNullable<Api['MessageResponse']>;
