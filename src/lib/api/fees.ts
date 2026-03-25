import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  FeeStructure,
  CreateFeeStructureRequest,
  UpdateFeeStructureRequest,
  Invoice,
} from '@/lib/types/fees';

// ---------------------------------------------------------------------------
// Fee Structures
// ---------------------------------------------------------------------------

export async function getFeeStructures(
  schoolId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<FeeStructure[]>> {
  const response = await apiClient.get<ApiResponse<FeeStructure[]>>(
    `/schools/${schoolId}/fees/structures`,
    { params },
  );
  return response.data;
}

export async function createFeeStructure(
  schoolId: string,
  data: CreateFeeStructureRequest,
): Promise<ApiResponse<FeeStructure>> {
  const response = await apiClient.post<ApiResponse<FeeStructure>>(
    `/schools/${schoolId}/fees/structures`,
    data,
  );
  return response.data;
}

export async function updateFeeStructure(
  schoolId: string,
  feeStructureId: string,
  data: UpdateFeeStructureRequest,
): Promise<ApiResponse<FeeStructure>> {
  const response = await apiClient.put<ApiResponse<FeeStructure>>(
    `/schools/${schoolId}/fees/structures/${feeStructureId}`,
    data,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export interface InvoiceListParams extends PaginatedParams {
  status?: string;
  classId?: string;
  studentId?: string;
}

export async function getInvoices(
  schoolId: string,
  params?: InvoiceListParams,
): Promise<ApiResponse<Invoice[]>> {
  const response = await apiClient.get<ApiResponse<Invoice[]>>(
    `/schools/${schoolId}/fees/invoices`,
    { params },
  );
  return response.data;
}

export async function generateInvoices(
  schoolId: string,
  termId: string,
  classId?: string,
): Promise<ApiResponse<Invoice[]>> {
  const response = await apiClient.post<ApiResponse<Invoice[]>>(
    `/schools/${schoolId}/fees/invoices/generate`,
    null,
    { params: { termId, ...(classId ? { classId } : {}) } },
  );
  return response.data;
}
