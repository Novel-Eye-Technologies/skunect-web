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

export interface MigrationJob {
  id: string;
  fileName: string;
  type: MigrationDataType;
  status: MigrationJobStatus;
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  errorCount: number;
  errors: MigrationError[];
  createdAt: string;
  completedAt: string | null;
}

export interface MigrationError {
  row: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  totalRecords: number;
  validRecords: number;
  errors: MigrationError[];
}
