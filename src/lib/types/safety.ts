import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreatePickupAuthorizationRequest = Api['CreatePickupAuthorizationRequest'];
export type RecordPickupRequest = Api['RecordPickupRequest'];

// Response types — generated schemas have all fields optional, keep hand-written
export interface EmergencyAlert {
  id: string;
  schoolId: string;
  title: string;
  message: string;
  severity: string;
  initiatedBy: string;
  isActive: boolean;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PickupLog {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  pickupPersonName: string;
  relationship: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  status: 'PENDING' | 'VERIFIED';
  createdAt: string;
}

export interface PickupAuthorization {
  id: string;
  schoolId: string;
  studentId: string;
  authorizedBy: string;
  pickupPersonName: string;
  pickupPersonPhone: string | null;
  pickupPersonRelationship: string | null;
  qrCode: string;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
}

// Keep hand-written — backend expects title + message + severity
export interface CreateEmergencyAlertRequest {
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// No generated schema — keep hand-written
export interface CreatePickupLogRequest {
  studentId: string;
  pickedUpByName: string;
  relationship: string;
  authorizationId?: string;
  notes?: string;
}
