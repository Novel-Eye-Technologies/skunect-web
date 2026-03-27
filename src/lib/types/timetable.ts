import type { Api } from '@/lib/api/schema';

// Response types from generated OpenAPI schemas
export type TimetableSlot = Api['TimetableSlotResponse'];
export type TimetableConfig = Api['TimetableConfigResponse'];

// Request types from generated OpenAPI schemas
export type CreateTimetableSlotRequest = Api['TimetableSlotRequest'];
export type TimetableConfigRequest = Api['TimetableConfigRequest'];
