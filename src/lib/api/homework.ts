import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  HomeworkListItem,
  HomeworkDetail,
  CreateHomeworkRequest,
  UpdateHomeworkRequest,
  Submission,
  GradeSubmissionRequest,
} from '@/lib/types/homework';

// ---------------------------------------------------------------------------
// Homework API functions
// ---------------------------------------------------------------------------

export interface HomeworkListParams extends PaginatedParams {
  classId?: string;
  subjectId?: string;
  status?: string;
  search?: string;
}

export async function getHomeworkList(
  schoolId: string,
  params?: HomeworkListParams,
): Promise<ApiResponse<HomeworkListItem[]>> {
  const response = await apiClient.get<ApiResponse<HomeworkListItem[]>>(
    `/schools/${schoolId}/homework`,
    { params },
  );
  return response.data;
}

export async function getHomework(
  schoolId: string,
  homeworkId: string,
): Promise<ApiResponse<HomeworkDetail>> {
  const response = await apiClient.get<ApiResponse<HomeworkDetail>>(
    `/schools/${schoolId}/homework/${homeworkId}`,
  );
  return response.data;
}

export async function createHomework(
  schoolId: string,
  data: CreateHomeworkRequest,
): Promise<ApiResponse<HomeworkDetail>> {
  // Backend expects plain JSON @RequestBody (not multipart).
  // The backend entity maps attachment_urls to a JSONB column; omitting the
  // field causes a Hibernate type mismatch (varchar ↔ jsonb).  Always send an
  // explicit array so PostgreSQL receives valid JSON.
  const payload = { attachmentUrls: [], ...data };
  const response = await apiClient.post<ApiResponse<HomeworkDetail>>(
    `/schools/${schoolId}/homework`,
    payload,
  );
  return response.data;
}

export async function updateHomework(
  schoolId: string,
  homeworkId: string,
  data: UpdateHomeworkRequest,
): Promise<ApiResponse<HomeworkDetail>> {
  const response = await apiClient.put<ApiResponse<HomeworkDetail>>(
    `/schools/${schoolId}/homework/${homeworkId}`,
    data,
  );
  return response.data;
}

export async function deleteHomework(
  schoolId: string,
  homeworkId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/schools/${schoolId}/homework/${homeworkId}`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Submissions
// ---------------------------------------------------------------------------

export async function getSubmissions(
  schoolId: string,
  homeworkId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<Submission[]>> {
  const response = await apiClient.get<ApiResponse<Submission[]>>(
    `/schools/${schoolId}/homework/${homeworkId}/submissions`,
    { params },
  );
  return response.data;
}

export async function gradeSubmission(
  schoolId: string,
  homeworkId: string,
  studentId: string,
  data: GradeSubmissionRequest,
): Promise<ApiResponse<Submission>> {
  // Backend endpoint expects studentId, not submissionId
  const response = await apiClient.put<ApiResponse<Submission>>(
    `/schools/${schoolId}/homework/${homeworkId}/submissions/${studentId}`,
    data,
  );
  return response.data;
}

export async function submitHomeworkForChild(
  studentId: string,
  homeworkId: string,
  data?: { attachmentUrls?: string[]; notes?: string },
): Promise<ApiResponse<Submission>> {
  const response = await apiClient.post<ApiResponse<Submission>>(
    `/parents/me/children/${studentId}/homework/${homeworkId}/submit`,
    data || {},
  );
  return response.data;
}
