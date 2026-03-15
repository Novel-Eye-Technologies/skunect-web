import apiClient from '@/lib/api/client';
import type { ApiResponse, PaginatedParams } from '@/lib/api/types';
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SchoolSubscription,
  CreateSchoolSubscriptionRequest,
  UpdateSchoolSubscriptionRequest,
  SubscriptionPayment,
  RecordPaymentRequest,
  ProrateCalculation,
  UpgradeRequest,
  SubscriptionDashboard,
  BulkExtendRequest,
  BulkRenewRequest,
  BulkOperationResponse,
  SubscriptionDiscount,
  CreateDiscountRequest,
  UpdateDiscountRequest,
  ValidateDiscountRequest,
  DiscountCalculation,
} from '@/lib/types/subscription';

// ---------------------------------------------------------------------------
// Super Admin — Subscription Plans
// ---------------------------------------------------------------------------

export async function getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
  const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/admin/subscription-plans');
  return response.data;
}

export async function getActiveSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
  const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/admin/subscription-plans/active');
  return response.data;
}

export async function getSubscriptionPlan(planId: string): Promise<ApiResponse<SubscriptionPlan>> {
  const response = await apiClient.get<ApiResponse<SubscriptionPlan>>(`/admin/subscription-plans/${planId}`);
  return response.data;
}

export async function createSubscriptionPlan(
  data: CreateSubscriptionPlanRequest,
): Promise<ApiResponse<SubscriptionPlan>> {
  const response = await apiClient.post<ApiResponse<SubscriptionPlan>>('/admin/subscription-plans', data);
  return response.data;
}

export async function updateSubscriptionPlan(
  planId: string,
  data: UpdateSubscriptionPlanRequest,
): Promise<ApiResponse<SubscriptionPlan>> {
  const response = await apiClient.put<ApiResponse<SubscriptionPlan>>(`/admin/subscription-plans/${planId}`, data);
  return response.data;
}

export async function deactivateSubscriptionPlan(planId: string): Promise<ApiResponse<null>> {
  const response = await apiClient.patch<ApiResponse<null>>(`/admin/subscription-plans/${planId}/deactivate`);
  return response.data;
}

// ---------------------------------------------------------------------------
// Super Admin — School Subscriptions
// ---------------------------------------------------------------------------

export async function getSchoolSubscription(schoolId: string): Promise<ApiResponse<SchoolSubscription>> {
  const response = await apiClient.get<ApiResponse<SchoolSubscription>>(
    `/admin/schools/${schoolId}/subscription`,
  );
  return response.data;
}

export async function createSchoolSubscription(
  schoolId: string,
  data: CreateSchoolSubscriptionRequest,
): Promise<ApiResponse<SchoolSubscription>> {
  const response = await apiClient.post<ApiResponse<SchoolSubscription>>(
    `/admin/schools/${schoolId}/subscription`,
    data,
  );
  return response.data;
}

export async function updateSchoolSubscription(
  schoolId: string,
  data: UpdateSchoolSubscriptionRequest,
): Promise<ApiResponse<SchoolSubscription>> {
  const response = await apiClient.put<ApiResponse<SchoolSubscription>>(
    `/admin/schools/${schoolId}/subscription`,
    data,
  );
  return response.data;
}

export async function cancelSchoolSubscription(schoolId: string): Promise<ApiResponse<null>> {
  const response = await apiClient.patch<ApiResponse<null>>(
    `/admin/schools/${schoolId}/subscription/cancel`,
  );
  return response.data;
}

export async function recordSubscriptionPayment(
  schoolId: string,
  data: RecordPaymentRequest,
): Promise<ApiResponse<SubscriptionPayment>> {
  const response = await apiClient.post<ApiResponse<SubscriptionPayment>>(
    `/admin/schools/${schoolId}/subscription/payments`,
    data,
  );
  return response.data;
}

export async function getSubscriptionPayments(
  schoolId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<SubscriptionPayment[]>> {
  const response = await apiClient.get<ApiResponse<SubscriptionPayment[]>>(
    `/admin/schools/${schoolId}/subscription/payments`,
    { params },
  );
  return response.data;
}

export async function calculateProration(
  schoolId: string,
  additionalStudents: number,
): Promise<ApiResponse<ProrateCalculation>> {
  const response = await apiClient.get<ApiResponse<ProrateCalculation>>(
    `/admin/schools/${schoolId}/subscription/prorate`,
    { params: { additionalStudents } },
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Super Admin — Dashboard
// ---------------------------------------------------------------------------

export async function getSubscriptionDashboard(): Promise<ApiResponse<SubscriptionDashboard>> {
  const response = await apiClient.get<ApiResponse<SubscriptionDashboard>>('/admin/subscription-dashboard');
  return response.data;
}

// ---------------------------------------------------------------------------
// Super Admin — Bulk Operations
// ---------------------------------------------------------------------------

export async function bulkExtendSubscriptions(
  data: BulkExtendRequest,
): Promise<ApiResponse<BulkOperationResponse>> {
  const response = await apiClient.post<ApiResponse<BulkOperationResponse>>(
    '/admin/subscriptions/bulk/extend',
    data,
  );
  return response.data;
}

export async function bulkRenewSubscriptions(
  data: BulkRenewRequest,
): Promise<ApiResponse<BulkOperationResponse>> {
  const response = await apiClient.post<ApiResponse<BulkOperationResponse>>(
    '/admin/subscriptions/bulk/renew',
    data,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Super Admin — Discounts
// ---------------------------------------------------------------------------

export async function getSubscriptionDiscounts(): Promise<ApiResponse<SubscriptionDiscount[]>> {
  const response = await apiClient.get<ApiResponse<SubscriptionDiscount[]>>('/admin/subscription-discounts');
  return response.data;
}

export async function getActiveDiscounts(): Promise<ApiResponse<SubscriptionDiscount[]>> {
  const response = await apiClient.get<ApiResponse<SubscriptionDiscount[]>>('/admin/subscription-discounts/active');
  return response.data;
}

export async function createDiscount(
  data: CreateDiscountRequest,
): Promise<ApiResponse<SubscriptionDiscount>> {
  const response = await apiClient.post<ApiResponse<SubscriptionDiscount>>('/admin/subscription-discounts', data);
  return response.data;
}

export async function updateDiscount(
  discountId: string,
  data: UpdateDiscountRequest,
): Promise<ApiResponse<SubscriptionDiscount>> {
  const response = await apiClient.put<ApiResponse<SubscriptionDiscount>>(
    `/admin/subscription-discounts/${discountId}`,
    data,
  );
  return response.data;
}

export async function deactivateDiscount(discountId: string): Promise<ApiResponse<null>> {
  const response = await apiClient.patch<ApiResponse<null>>(
    `/admin/subscription-discounts/${discountId}/deactivate`,
  );
  return response.data;
}

export async function validateDiscount(
  data: ValidateDiscountRequest,
): Promise<ApiResponse<DiscountCalculation>> {
  const response = await apiClient.post<ApiResponse<DiscountCalculation>>(
    '/admin/subscription-discounts/validate',
    data,
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// Payment Receipt Download
// ---------------------------------------------------------------------------

export async function downloadPaymentReceipt(schoolId: string, paymentId: string): Promise<Blob> {
  const response = await apiClient.get(
    `/admin/schools/${schoolId}/subscription/payments/${paymentId}/receipt`,
    { responseType: 'blob' },
  );
  return response.data;
}

export async function downloadMyPaymentReceipt(schoolId: string, paymentId: string): Promise<Blob> {
  const response = await apiClient.get(
    `/schools/${schoolId}/subscription/payments/${paymentId}/receipt`,
    { responseType: 'blob' },
  );
  return response.data;
}

// ---------------------------------------------------------------------------
// School Admin — Own Subscription
// ---------------------------------------------------------------------------

export async function getMySubscription(schoolId: string): Promise<ApiResponse<SchoolSubscription>> {
  const response = await apiClient.get<ApiResponse<SchoolSubscription>>(
    `/schools/${schoolId}/subscription`,
  );
  return response.data;
}

export async function getMySubscriptionPayments(
  schoolId: string,
  params?: PaginatedParams,
): Promise<ApiResponse<SubscriptionPayment[]>> {
  const response = await apiClient.get<ApiResponse<SubscriptionPayment[]>>(
    `/schools/${schoolId}/subscription/payments`,
    { params },
  );
  return response.data;
}

export async function calculateMyProration(
  schoolId: string,
  additionalStudents: number,
): Promise<ApiResponse<ProrateCalculation>> {
  const response = await apiClient.get<ApiResponse<ProrateCalculation>>(
    `/schools/${schoolId}/subscription/prorate`,
    { params: { additionalStudents } },
  );
  return response.data;
}

export async function requestUpgrade(
  schoolId: string,
  data: UpgradeRequest,
): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>(
    `/schools/${schoolId}/subscription/upgrade-request`,
    data,
  );
  return response.data;
}
