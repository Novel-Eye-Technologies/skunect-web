import type { Api } from '@/lib/api/schema';

export interface NotificationPreference {
  id: string;
  type: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

// Request types from generated OpenAPI schemas
export type UpdatePreferenceRequest = Api['UpdatePreferenceRequest'];
