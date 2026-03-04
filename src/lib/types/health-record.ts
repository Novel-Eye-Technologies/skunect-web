export interface HealthRecord {
  id: string;
  studentId: string;
  studentName: string;
  recordType: string;
  title: string;
  description: string | null;
  severity: string | null;
  recordedBy: string;
  recordedByName: string;
  recordedAt: string;
  isActive: boolean;
}

export interface CreateHealthRecordRequest {
  studentId: string;
  recordType: string;
  title: string;
  description?: string;
  severity?: string;
}

export interface UpdateHealthRecordRequest {
  recordType?: string;
  title?: string;
  description?: string;
  severity?: string;
  isActive?: boolean;
}

export const RECORD_TYPES = [
  'ALLERGY',
  'CONDITION',
  'MEDICATION',
  'VACCINATION',
  'INCIDENT',
  'NOTE',
] as const;

export const SEVERITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
