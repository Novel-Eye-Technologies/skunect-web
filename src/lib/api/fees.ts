import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type { Api } from '@/lib/api/schema';
import type {
  FeeStructure,
  CreateFeeStructureRequest,
  UpdateFeeStructureRequest,
  Invoice,
  GenerateInvoicesRequest,
  RecordPaymentRequest,
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

export async function deleteFeeStructure(
  schoolId: string,
  feeStructureId: string,
): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/schools/${schoolId}/fees/structures/${feeStructureId}`,
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
  search?: string;
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

export async function getInvoice(
  schoolId: string,
  invoiceId: string,
): Promise<ApiResponse<Invoice>> {
  const response = await apiClient.get<ApiResponse<Invoice>>(
    `/schools/${schoolId}/fees/invoices/${invoiceId}`,
  );
  return response.data;
}

export async function generateInvoices(
  schoolId: string,
  data: GenerateInvoicesRequest,
): Promise<ApiResponse<Invoice[]>> {
  const response = await apiClient.post<ApiResponse<Invoice[]>>(
    `/schools/${schoolId}/fees/invoices/generate`,
    null,
    { params: { termId: data.termId, classId: data.classId } },
  );
  return response.data;
}

export async function recordPayment(
  schoolId: string,
  invoiceId: string,
  data: RecordPaymentRequest,
): Promise<ApiResponse<Invoice>> {
  const response = await apiClient.post<ApiResponse<Invoice>>(
    `/schools/${schoolId}/fees/invoices/${invoiceId}/record-payment`,
    data,
  );
  return response.data;
}

export async function cancelInvoice(
  schoolId: string,
  invoiceId: string,
  data: Api['CancelInvoiceRequest'],
): Promise<ApiResponse<Invoice>> {
  const response = await apiClient.post<ApiResponse<Invoice>>(
    `/schools/${schoolId}/fees/invoices/${invoiceId}/cancel`,
    data,
  );
  return response.data;
}
