import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreatePickupAuthorizationRequest = Api['CreatePickupAuthorizationRequest'];
export type RecordPickupRequest = Api['RecordPickupRequest'];

// Response types — generated schemas have all fields optional, keep hand-written
export interface EmergencyAlert {
  id: string;
  type: 'LOCKDOWN' | 'EVACUATION' | 'MEDICAL' | 'WEATHER' | 'OTHER';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'RESOLVED';
  createdBy: string;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
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

// Frontend uses 'description' but backend expects 'message' — API layer maps this.
// Keep hand-written.
export interface CreateEmergencyAlertRequest {
  type: 'LOCKDOWN' | 'EVACUATION' | 'MEDICAL' | 'WEATHER' | 'OTHER';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// No generated schema — keep hand-written
export interface CreatePickupLogRequest {
  studentId: string;
  pickupPersonName: string;
  relationship: string;
  authorizationId?: string;
  notes?: string;
}
