import type { Api } from '@/lib/api/schema';

export interface WelfareEntry {
  studentId: string;
  status: string;
  notes: string;
}

// Request types from generated OpenAPI schemas
export type RecordWelfareRequest = Api['RecordWelfareRequest'];

export interface WelfareRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  status: string;
  notes: string;
  date: string;
  recordedBy: string;
  createdAt: string;
}
