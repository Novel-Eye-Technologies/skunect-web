// Types matching the Spring Boot backend DTOs

export interface AcademicSession {
  id: string;
  schoolId: string;
  name: string; // e.g. "2024/2025"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
}

export interface Term {
  id: string;
  sessionId: string;
  name: string; // e.g. "First Term"
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

export interface AssignSubjectTeacherRequest {
  teacherId: string | null;
}

export interface BulkAssignSubjectsRequest {
  subjectIds: string[];
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
  gradeLabel: string; // e.g. "A", "B", etc.
  minScore: number;
  maxScore: number;
  remark: string; // e.g. "Excellent"
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

// Request types
export interface CreateSessionRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSessionRequest extends CreateSessionRequest {
  isCurrent?: boolean;
}

export interface CreateTermRequest {
  sessionId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateTermRequest extends CreateTermRequest {
  isCurrent?: boolean;
}

export interface CreateClassRequest {
  name: string;
  gradeLevel?: string;
  sessionId: string;
  capacity?: number;
  classTeacherId?: string;
}

export interface UpdateClassRequest extends CreateClassRequest {}

export interface CreateSubjectRequest {
  name: string;
  code: string;
}

export interface UpdateSubjectRequest extends CreateSubjectRequest {}

export interface CreateGradingSystemRequest {
  name: string;
  scales: Omit<GradeDefinition, 'id'>[];
  isDefault?: boolean;
}

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
