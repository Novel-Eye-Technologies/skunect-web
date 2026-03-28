import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreateSessionRequest = Api['CreateSessionRequest'];
export type CreateTermRequest = Api['CreateTermRequest'];
export type CreateSubjectRequest = Api['CreateSubjectRequest'];
export type BulkAssignSubjectsRequest = Api['BulkAssignSubjectsRequest'];
export type CreateClassRequest = Api['CreateClassRequest'];
export type CreateGradingSystemRequest = Api['CreateGradingSystemRequest'];

export type ClassSubject = Api['ClassSubjectResponse'];

// AssignSubjectTeacherRequest — generated uses `teacherId?: string`, hand-written uses
// `teacherId: string | null`. Keep hand-written for null support (unassign teacher).
export interface AssignSubjectTeacherRequest {
  teacherId: string | null;
}

// Response types from generated OpenAPI schemas
export type AcademicSession = Api['SessionResponse'];
export type Term = Api['TermResponse'];
export type SchoolClass = Api['ClassResponse'] & {
  /** Backend returns studentCount but OpenAPI spec omits it */
  studentCount?: number;
  /** Alias: backend may also return section alongside gradeLevel */
  section?: string | null;
};
export type Subject = Api['SubjectResponse'] & {
  /** Backend returns description but OpenAPI spec omits it */
  description?: string | null;
};
export type GradingSystem = Api['GradingSystemResponse'] & {
  /** Backend returns createdAt but OpenAPI spec omits it */
  createdAt?: string;
};
export type GradeDefinition = Api['GradingScaleResponse'];

// No generated schema — keep hand-written
export interface SchoolSettings {
  id: string;
  schoolId: string;
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
  motto: string | null;
  website: string | null;
  state: string | null;
  lga: string | null;
  country: string;
  currentSessionId: string | null;
  currentTermId: string | null;
}

// No generated schema for these Update types — keep hand-written
export interface UpdateSessionRequest extends CreateSessionRequest {
  isCurrent?: boolean;
}

export interface UpdateTermRequest extends CreateTermRequest {
  isCurrent?: boolean;
}

export interface UpdateClassRequest extends CreateClassRequest {}

export interface UpdateSubjectRequest extends CreateSubjectRequest {}

export interface UpdateGradingSystemRequest extends CreateGradingSystemRequest {}

export interface UpdateSchoolSettingsRequest {
  schoolName?: string;
  address?: string;
  phone?: string;
  email?: string;
  motto?: string;
  website?: string;
  state?: string;
  lga?: string;
  country?: string;
  currentSessionId?: string;
  currentTermId?: string;
  logoUrl?: string;
}
