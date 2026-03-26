import type { Api } from '@/lib/api/schema';

export type SubscriptionTier = 'STANDARD' | 'PREMIUM';
export type SubscriptionStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'GRACE_PERIOD'
  | 'CANCELLED'
  | 'PENDING';
export type PaymentType =
  | 'FULL'
  | 'PARTIAL'
  | 'PRORATED'
  | 'UPGRADE'
  | 'RENEWAL';
export type PaymentMethod = 'BANK_TRANSFER' | 'CARD' | 'CASH';

export type SubscriptionPlan = Api['SubscriptionPlanResponse'];

// Generated types use undefined for optional fields, but code passes null — keep hand-written
export interface CreateSubscriptionPlanRequest {
  name: string;
  tier: SubscriptionTier;
  pricePerStudent: number;
  billingPeriodMonths?: number;
  maxStudents?: number | null;
  features?: string;
  isTrial?: boolean;
  trialDurationDays?: number;
}

export interface UpdateSubscriptionPlanRequest {
  name?: string;
  tier?: SubscriptionTier;
  pricePerStudent?: number;
  billingPeriodMonths?: number;
  maxStudents?: number | null;
  features?: string;
  isTrial?: boolean;
  trialDurationDays?: number;
}

export type SchoolSubscription = Api["SchoolSubscriptionResponse"];

export type CreateSchoolSubscriptionRequest =
  Api['CreateSchoolSubscriptionRequest'];
export type UpdateSchoolSubscriptionRequest =
  Api['UpdateSchoolSubscriptionRequest'];

// Generated RecordPaymentRequest is for fee payments, not subscription — keep hand-written
export interface RecordPaymentRequest {
  amount: number;
  paymentType: PaymentType;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  description?: string;
  paidAt?: string;
  studentsAdded?: number;
  prorationMonths?: number;
}

export type SubscriptionPayment = Api['SubscriptionPaymentResponse'];
export type ProrateCalculation = Api['ProrateCalculationResponse'];

export type UpgradeRequest = Api['UpgradeRequest'];

// Bulk operations
export type BulkExtendRequest = Api['BulkExtendRequest'];
export type BulkRenewRequest = Api['BulkRenewRequest'];
export type BulkOperationResult = Api['BulkOperationResult'];
export type BulkOperationResponse = Api['BulkOperationResponse'];

// Discounts
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type SubscriptionDiscount = Api['SubscriptionDiscountResponse'];

export type CreateDiscountRequest = Api['CreateSubscriptionDiscountRequest'];
export type UpdateDiscountRequest = Api['UpdateSubscriptionDiscountRequest'];

export interface ValidateDiscountRequest {
  code: string;
  amount: number;
  tier: string;
  studentCount: number;
}

export type DiscountCalculation = Api['ApplyDiscountResponse'];

export type SubscriptionDashboard = Api['SubscriptionDashboardResponse'];
