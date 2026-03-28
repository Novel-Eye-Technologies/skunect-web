import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreatePickupAuthorizationRequest = Api['CreatePickupAuthorizationRequest'];
export type RecordPickupRequest = Api['RecordPickupRequest'];
export type CreateEmergencyAlertRequest = Api['CreateEmergencyAlertRequest'];

// Response types from generated OpenAPI schemas
export type EmergencyAlert = Api['EmergencyAlertResponse'];
export type PickupAuthorization = Api['PickupAuthorizationResponse'];
export type PickupLog = Api['PickupLogResponse'];

// No generated schema — keep hand-written
export interface CreatePickupLogRequest {
  studentId: string;
  pickedUpByName: string;
  relationship: string;
  authorizationId?: string;
  notes?: string;
}
