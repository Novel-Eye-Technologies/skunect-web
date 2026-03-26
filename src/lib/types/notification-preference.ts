import type { Api } from '@/lib/api/schema';

export interface NotificationPreference {
  id: string;
  type: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
}

// Request types from generated OpenAPI schemas
export type UpdatePreferenceRequest = Api['UpdatePreferenceRequest'];
