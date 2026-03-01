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
  type: 'LOCKDOWN' | 'EVACUATION' | 'MEDICAL' | 'WEATHER' | 'OTHER';
  title: string;
  description: string;
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
  pickupPersonName: string;
  relationship: string;
}
