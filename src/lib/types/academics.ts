import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreateAssessmentRequest = Api['CreateAssessmentRequest'];
export type BulkGradeRequest = Api['BulkGradeRequest'];
export type GradeEntry = Api['GradeEntry'];
export type GenerateReportCardsRequest = Api['GenerateReportCardsRequest'];
export type AssessmentCommentRequest = Api['AssessmentCommentRequest'];

// Response types from generated OpenAPI schemas
export type GradeResponse = Api['GradeResponse'];
export type AssessmentCommentResponse = Api['AssessmentCommentResponse'];
export type Assessment = Api['AssessmentResponse'];
export type ReportCard = Api['ReportCardResponse'];

// No generated schema — keep hand-written
export interface UpdateAssessmentRequest extends Partial<CreateAssessmentRequest> {}

export interface StudentScore {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  score: number | null;
}

export interface BulkScoreEntry {
  studentId: string;
  score: number;
}

export interface BulkScoreRequest {
  grades: BulkScoreEntry[];
}
