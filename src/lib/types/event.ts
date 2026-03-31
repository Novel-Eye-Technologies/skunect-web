import type { Api } from '@/lib/api/schema';

// Response types from generated OpenAPI schemas
export type EventItem = Api['EventResponse'];
export type CoordinatorInfo = Api['CoordinatorInfo'];

// Request types from generated OpenAPI schemas
export type CreateEventRequest = Api['CreateEventRequest'];
export type UpdateEventRequest = Api['UpdateEventRequest'];
