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

export interface CreateEmergencyAlertRequest {
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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

export interface CreatePickupLogRequest {
  studentId: string;
  pickedUpByName: string;
  relationship: string;
  authorizationId?: string;
  notes?: string;
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

export interface CreatePickupAuthorizationRequest {
  studentId: string;
  pickupPersonName: string;
  pickupPersonPhone?: string;
  pickupPersonRelationship?: string;
  validFrom?: string;
  validUntil?: string;
}
