import type { Api } from '@/lib/api/schema';

export interface EligibleStudent {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  averageScore: number;
  eligible: boolean;
}

// Request types from generated OpenAPI schemas
export type BulkPromoteRequest = Api['BulkPromoteRequest'];

export interface PromotionRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  fromClassId: string;
  fromClassName: string;
  toClassId: string;
  toClassName: string;
  sessionId: string;
  status: string;
  remarks: string | null;
  createdAt: string;
}
