export interface NotificationPreference {
  id: string;
  type: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface UpdatePreferenceRequest {
  type: string;
  email?: boolean;
  push?: boolean;
  sms?: boolean;
}
