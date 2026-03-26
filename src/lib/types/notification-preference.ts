export interface NotificationPreference {
  id: string;
  type: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
}

export interface UpdatePreferenceRequest {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
}
