import type { Api } from '@/lib/api/schema';

export type SubscriptionTier = 'STANDARD' | 'PREMIUM';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'GRACE_PERIOD' | 'CANCELLED' | 'PENDING';
export type PaymentType = 'FULL' | 'PARTIAL' | 'PRORATED' | 'UPGRADE' | 'RENEWAL';
export type PaymentMethod = 'BANK_TRANSFER' | 'CARD' | 'CASH';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  pricePerStudent: number;
  billingPeriodMonths: number;
  maxStudents: number | null;
  features: string | null;
  isTrial: boolean;
  trialDurationDays: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface SchoolSubscription {
  id: string;
  schoolId: string;
  schoolName: string;
  planId: string;
  planName: string;
  planTier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  studentLimit: number;
  activeStudentCount: number;
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  gracePeriodDays: number;
  isAutoRenew: boolean;
  notes: string | null;
  daysUntilExpiry: number;
  studentUsagePercent: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateSchoolSubscriptionRequest = Api['CreateSchoolSubscriptionRequest'];
export type UpdateSchoolSubscriptionRequest = Api['UpdateSchoolSubscriptionRequest'];
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

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  schoolId: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod | null;
  paymentReference: string | null;
  description: string | null;
  paidAt: string | null;
  recordedBy: string | null;
  recordedByName: string | null;
  studentsAdded: number;
  prorationMonths: number | null;
  createdAt: string;
}

export interface ProrateCalculation {
  additionalStudents: number;
  remainingMonths: number;
  monthlyRatePerStudent: number;
  proratedAmount: number;
  newStudentLimit: number;
  newTotalAmount: number;
  breakdown: string;
}

export type UpgradeRequest = Api['UpgradeRequest'];

// Bulk operations
export type BulkExtendRequest = Api['BulkExtendRequest'];
export type BulkRenewRequest = Api['BulkRenewRequest'];

export interface BulkOperationResult {
  schoolId: string;
  schoolName: string;
  success: boolean;
  message: string;
}

export interface BulkOperationResponse {
  totalRequested: number;
  successCount: number;
  failureCount: number;
  results: BulkOperationResult[];
}

// Discounts
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface SubscriptionDiscount {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxUses: number | null;
  currentUses: number;
  validFrom: string;
  validUntil: string | null;
  applicableTiers: string[] | null;
  minStudents: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateDiscountRequest = Api['CreateSubscriptionDiscountRequest'];
export type UpdateDiscountRequest = Api['UpdateSubscriptionDiscountRequest'];

export interface ValidateDiscountRequest {
  code: string;
  amount: number;
  tier: string;
  studentCount: number;
}

export interface DiscountCalculation {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountName: string;
  discountCode: string;
}

export interface SubscriptionDashboard {
  totalActiveSubscriptions: number;
  totalGracePeriodSubscriptions: number;
  totalExpiredSubscriptions: number;
  totalPendingSubscriptions: number;
  totalRevenue: number;
  totalOutstanding: number;
  expiringWithin30Days: SchoolSubscription[];
  inGracePeriod: SchoolSubscription[];
}
