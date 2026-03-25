import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  Assessment,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  StudentScore,
  BulkScoreRequest,
  ReportCard,
  GenerateReportCardsRequest,
} from '@/lib/types/academics';

// ---------------------------------------------------------------------------
// Params
// ---------------------------------------------------------------------------

export interface AssessmentListParams extends PaginatedParams {
  classId?: string;
  subjectId?: string;
  termId?: string;
}

export interface ReportCardListParams {
  classId?: string;
  termId?: string;
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export async function getAssessments(
  schoolId: string,
  params?: AssessmentListParams,
): Promise<ApiResponse<Assessment[]>> {
  const response = await apiClient.get<ApiResponse<Assessment[]>>(
    `/schools/${schoolId}/assessments`,
    { params },
  );
  return response.data;
}

export async function createAssessment(
  schoolId: string,
  data: CreateAssessmentRequest,
): Promise<ApiResponse<Assessment>> {
  const response = await apiClient.post<ApiResponse<Assessment>>(
    `/schools/${schoolId}/assessments`,
    data,
  );
  return response.data;
}

export async function updateAssessment(
  schoolId: string,
  assessmentId: string,
  data: UpdateAssessmentRequest,
): Promise<ApiResponse<Assessment>> {
  const response = await apiClient.put<ApiResponse<Assessment>>(
    `/schools/${schoolId}/assessments/${assessmentId}`,
    data,
  );
  return response.data;
}

export async function deleteAssessment(
  schoolId: string,
  assessmentId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/schools/${schoolId}/assessments/${assessmentId}`,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Scores
// ---------------------------------------------------------------------------

export async function getAssessmentScores(
  schoolId: string,
  assessmentId: string,
): Promise<ApiResponse<StudentScore[]>> {
  const response = await apiClient.get<ApiResponse<StudentScore[]>>(
    `/schools/${schoolId}/assessments/${assessmentId}/grades`,
  );
  return response.data;
}

export async function submitBulkScores(
  schoolId: string,
  assessmentId: string,
  data: BulkScoreRequest,
): Promise<ApiResponse<void>> {
  const response = await apiClient.put<ApiResponse<void>>(
    `/schools/${schoolId}/assessments/${assessmentId}/grades`,
    data,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Report Cards
// ---------------------------------------------------------------------------

export async function getReportCards(
  schoolId: string,
  params?: ReportCardListParams,
): Promise<ApiResponse<ReportCard[]>> {
  const response = await apiClient.get<ApiResponse<ReportCard[]>>(
    `/schools/${schoolId}/report-cards`,
    { params },
  );
  return response.data;
}

export async function generateReportCards(
  schoolId: string,
  data: GenerateReportCardsRequest,
): Promise<ApiResponse<void>> {
  const response = await apiClient.post<ApiResponse<void>>(
    `/schools/${schoolId}/report-cards/generate`,
    data,
  );
  return response.data;
}

export async function publishReportCard(
  schoolId: string,
  reportCardId: string,
): Promise<ApiResponse<void>> {
  const response = await apiClient.post<ApiResponse<void>>(
    `/schools/${schoolId}/report-cards/${reportCardId}/publish`,
  );
  return response.data;
}

export async function downloadReportCardPdf(
  schoolId: string,
  reportCardId: string,
): Promise<void> {
  const response = await apiClient.get(
    `/schools/${schoolId}/report-cards/${reportCardId}/pdf`,
    { responseType: 'blob' },
  );

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `report-card-${reportCardId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
