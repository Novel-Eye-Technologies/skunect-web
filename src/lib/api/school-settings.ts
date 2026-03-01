import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import type {
  AcademicSession,
  Term,
  SchoolClass,
  Subject,
  GradingSystem,
  SchoolSettings,
  CreateSessionRequest,
  UpdateSessionRequest,
  CreateTermRequest,
  UpdateTermRequest,
  CreateClassRequest,
  UpdateClassRequest,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  CreateGradingSystemRequest,
  UpdateGradingSystemRequest,
  UpdateSchoolSettingsRequest,
} from '@/lib/types/school';

// ---------------------------------------------------------------------------
// School Settings
// ---------------------------------------------------------------------------

export async function getSchoolSettings(
  schoolId: string,
): Promise<ApiResponse<SchoolSettings>> {
  const response = await apiClient.get<ApiResponse<SchoolSettings>>(
    `/schools/${schoolId}/settings`,
  );
  return response.data;
}

export async function updateSchoolSettings(
  schoolId: string,
  data: UpdateSchoolSettingsRequest,
): Promise<ApiResponse<SchoolSettings>> {
  const response = await apiClient.put<ApiResponse<SchoolSettings>>(
    `/schools/${schoolId}/settings`,
    data,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Academic Sessions
// ---------------------------------------------------------------------------

export async function getSessions(
  schoolId: string,
): Promise<ApiResponse<AcademicSession[]>> {
  const response = await apiClient.get<ApiResponse<AcademicSession[]>>(
    `/schools/${schoolId}/sessions`,
  );
  return response.data;
}

export async function createSession(
  schoolId: string,
  data: CreateSessionRequest,
): Promise<ApiResponse<AcademicSession>> {
  const response = await apiClient.post<ApiResponse<AcademicSession>>(
    `/schools/${schoolId}/sessions`,
    data,
  );
  return response.data;
}

export async function updateSession(
  schoolId: string,
  sessionId: string,
  data: UpdateSessionRequest,
): Promise<ApiResponse<AcademicSession>> {
  const response = await apiClient.put<ApiResponse<AcademicSession>>(
    `/schools/${schoolId}/sessions/${sessionId}`,
    data,
  );
  return response.data;
}

export async function deleteSession(
  schoolId: string,
  sessionId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/sessions/${sessionId}`,
  );
  return response.data;
}

export async function setCurrentSession(
  schoolId: string,
  sessionId: string,
): Promise<ApiResponse<AcademicSession>> {
  const response = await apiClient.post<ApiResponse<AcademicSession>>(
    `/schools/${schoolId}/sessions/${sessionId}/set-current`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Terms
// ---------------------------------------------------------------------------

export async function getTerms(
  schoolId: string,
  sessionId: string,
): Promise<ApiResponse<Term[]>> {
  const response = await apiClient.get<ApiResponse<Term[]>>(
    `/schools/${schoolId}/terms`,
    { params: { sessionId } },
  );
  return response.data;
}

export async function createTerm(
  schoolId: string,
  data: CreateTermRequest,
): Promise<ApiResponse<Term>> {
  const response = await apiClient.post<ApiResponse<Term>>(
    `/schools/${schoolId}/terms`,
    data,
  );
  return response.data;
}

export async function updateTerm(
  schoolId: string,
  termId: string,
  data: UpdateTermRequest,
): Promise<ApiResponse<Term>> {
  const response = await apiClient.put<ApiResponse<Term>>(
    `/schools/${schoolId}/terms/${termId}`,
    data,
  );
  return response.data;
}

export async function deleteTerm(
  schoolId: string,
  termId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/terms/${termId}`,
  );
  return response.data;
}

export async function setCurrentTerm(
  schoolId: string,
  termId: string,
): Promise<ApiResponse<Term>> {
  const response = await apiClient.post<ApiResponse<Term>>(
    `/schools/${schoolId}/terms/${termId}/set-current`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

export async function getClasses(
  schoolId: string,
): Promise<ApiResponse<SchoolClass[]>> {
  const response = await apiClient.get<ApiResponse<SchoolClass[]>>(
    `/schools/${schoolId}/classes`,
  );
  return response.data;
}

export async function createClass(
  schoolId: string,
  data: CreateClassRequest,
): Promise<ApiResponse<SchoolClass>> {
  const response = await apiClient.post<ApiResponse<SchoolClass>>(
    `/schools/${schoolId}/classes`,
    data,
  );
  return response.data;
}

export async function updateClass(
  schoolId: string,
  classId: string,
  data: UpdateClassRequest,
): Promise<ApiResponse<SchoolClass>> {
  const response = await apiClient.put<ApiResponse<SchoolClass>>(
    `/schools/${schoolId}/classes/${classId}`,
    data,
  );
  return response.data;
}

export async function deleteClass(
  schoolId: string,
  classId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/classes/${classId}`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------

export async function getSubjects(
  schoolId: string,
): Promise<ApiResponse<Subject[]>> {
  const response = await apiClient.get<ApiResponse<Subject[]>>(
    `/schools/${schoolId}/subjects`,
  );
  return response.data;
}

export async function createSubject(
  schoolId: string,
  data: CreateSubjectRequest,
): Promise<ApiResponse<Subject>> {
  const response = await apiClient.post<ApiResponse<Subject>>(
    `/schools/${schoolId}/subjects`,
    data,
  );
  return response.data;
}

export async function updateSubject(
  schoolId: string,
  subjectId: string,
  data: UpdateSubjectRequest,
): Promise<ApiResponse<Subject>> {
  const response = await apiClient.put<ApiResponse<Subject>>(
    `/schools/${schoolId}/subjects/${subjectId}`,
    data,
  );
  return response.data;
}

export async function deleteSubject(
  schoolId: string,
  subjectId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/subjects/${subjectId}`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Grading Systems
// ---------------------------------------------------------------------------

export async function getGradingSystems(
  schoolId: string,
): Promise<ApiResponse<GradingSystem[]>> {
  const response = await apiClient.get<ApiResponse<GradingSystem[]>>(
    `/schools/${schoolId}/grading-systems`,
  );
  return response.data;
}

export async function createGradingSystem(
  schoolId: string,
  data: CreateGradingSystemRequest,
): Promise<ApiResponse<GradingSystem>> {
  const response = await apiClient.post<ApiResponse<GradingSystem>>(
    `/schools/${schoolId}/grading-systems`,
    data,
  );
  return response.data;
}

export async function updateGradingSystem(
  schoolId: string,
  id: string,
  data: UpdateGradingSystemRequest,
): Promise<ApiResponse<GradingSystem>> {
  const response = await apiClient.put<ApiResponse<GradingSystem>>(
    `/schools/${schoolId}/grading-systems/${id}`,
    data,
  );
  return response.data;
}

export async function deleteGradingSystem(
  schoolId: string,
  id: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/grading-systems/${id}`,
  );
  return response.data;
}
