import type { Api } from '@/lib/api/schema';

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

// Request types from generated OpenAPI schemas
export type CreateHealthRecordRequest = Api['CreateHealthRecordRequest'];
export type UpdateHealthRecordRequest = Api['UpdateHealthRecordRequest'];

export const RECORD_TYPES = [
  'ALLERGY',
  'CONDITION',
  'MEDICATION',
  'VACCINATION',
  'INCIDENT',
  'NOTE',
] as const;

export const SEVERITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
