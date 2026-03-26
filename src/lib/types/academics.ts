import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreateAssessmentRequest = Api['CreateAssessmentRequest'];
export type BulkGradeRequest = Api['BulkGradeRequest'];
export type GradeEntry = Api['GradeEntry'];
export type GenerateReportCardsRequest = Api['GenerateReportCardsRequest'];
export type AssessmentCommentRequest = Api['AssessmentCommentRequest'];

// Response types — generated schemas have all fields optional, so keep
// hand-written versions with correct required/optional marking.
export interface Assessment {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  termId: string;
  termName: string;
  type: 'CA1' | 'CA2' | 'CA3' | 'EXAM';
  title: string;
  maxScore: number;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface GradeResponse {
  id: string;
  studentId: string;
  assessmentId: string;
  studentName: string;
  admissionNumber: string;
  gradeLabel: string;
  remark: string;
  score: number;
}

export interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  termId: string;
  termName: string;
  sessionName: string;
  status: 'DRAFT' | 'PUBLISHED';
  totalScore: number;
  average: number;
  position: number;
  totalStudents: number;
  generatedAt: string;
}

export interface AssessmentCommentResponse {
  id: string;
  assessmentId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

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
