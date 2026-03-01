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
  files?: File[],
): Promise<ApiResponse<HomeworkDetail>> {
  const formData = new FormData();
  formData.append(
    'data',
    new Blob([JSON.stringify(data)], { type: 'application/json' }),
  );

  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('files', file);
    });
  }

  const response = await apiClient.post<ApiResponse<HomeworkDetail>>(
    `/schools/${schoolId}/homework`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
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
  submissionId: string,
  data: GradeSubmissionRequest,
): Promise<ApiResponse<Submission>> {
  const response = await apiClient.put<ApiResponse<Submission>>(
    `/schools/${schoolId}/homework/${homeworkId}/submissions/${submissionId}/grade`,
    data,
  );
  return response.data;
}
