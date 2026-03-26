import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas (where field shapes match)
export type CreateSessionRequest = Api['CreateSessionRequest'];
export type CreateTermRequest = Api['CreateTermRequest'];
export type CreateSubjectRequest = Api['CreateSubjectRequest'];
export type BulkAssignSubjectsRequest = Api['BulkAssignSubjectsRequest'];

// CreateClassRequest — generated uses `sessionId` (required) + `gradeLevel`, hand-written
// uses `section` + `sessionId?`. Incompatible; keep hand-written.
export interface CreateClassRequest {
  name: string;
  section?: string;
  capacity: number;
  classTeacherId: string;
  sessionId?: string;
}

// AssignSubjectTeacherRequest — generated uses `teacherId?: string`, hand-written uses
// `teacherId: string | null`. Keep hand-written for null support.
export interface AssignSubjectTeacherRequest {
  teacherId: string | null;
}

// CreateGradingSystemRequest — generated uses `default?`, hand-written uses `isDefault?`.
// Incompatible field name; keep hand-written.
export interface CreateGradingSystemRequest {
  name: string;
  scales: Omit<GradeDefinition, 'id'>[];
  isDefault?: boolean;
}

// Response types — generated schemas have all fields optional, keep hand-written
// with correct required/optional marking.

export interface AcademicSession {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface Term {
  id: string;
  sessionId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isClosed: boolean;
  createdAt: string;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  name: string;
  section: string | null;
  capacity: number;
  classTeacherId: string | null;
  classTeacherName: string | null;
  studentCount: number;
  createdAt: string;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
}

export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherId: string | null;
  teacherName: string | null;
  termId: string;
  termName: string | null;
  isClassTeacher: boolean;
}

export interface GradingSystem {
  id: string;
  schoolId: string;
  name: string;
  scales: GradeDefinition[];
  isDefault: boolean;
  createdAt: string;
}

export interface GradeDefinition {
  id?: string;
  gradeLabel: string;
  minScore: number;
  maxScore: number;
  remark: string;
}

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
