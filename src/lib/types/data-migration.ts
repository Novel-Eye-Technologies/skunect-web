import type { Api } from '@/lib/api/schema';

// ---------------------------------------------------------------------------
// Data Migration types
// ---------------------------------------------------------------------------

export type MigrationDataType =
  | 'STUDENTS'
  | 'TEACHERS'
  | 'CLASSES'
  | 'SUBJECTS'
  | 'FEES';

export type MigrationJobStatus =
  | 'PENDING'
  | 'VALIDATING'
  | 'VALIDATED'
  | 'IMPORTING'
  | 'COMPLETED'
  | 'FAILED';

export type MigrationJob = Api["MigrationJobResponse"];

// MigrationError — no match in generated schema; keep hand-written
export interface MigrationError {
  row: number;
  field: string;
  message: string;
}

// ValidationResult — no match in generated schema; keep hand-written
export interface ValidationResult {
  valid: boolean;
  totalRecords: number;
  validRecords: number;
  errors: MigrationError[];
}
