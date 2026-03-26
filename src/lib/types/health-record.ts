import type { Api } from '@/lib/api/schema';

// Response type from generated OpenAPI schema
// Required<> used because backend always populates all fields but OpenAPI spec marks them optional
export type HealthRecord = Api['HealthRecordResponse'];

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
