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

export interface CreateSchoolSubscriptionRequest {
  planId: string;
  startDate: string;
  endDate: string;
  studentLimit: number;
  gracePeriodDays?: number;
  autoRenew?: boolean;
  notes?: string;
}

export interface UpdateSchoolSubscriptionRequest {
  endDate?: string;
  studentLimit?: number;
  gracePeriodDays?: number;
  autoRenew?: boolean;
  notes?: string;
  status?: SubscriptionStatus;
}

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

export interface UpgradeRequest {
  additionalStudents?: number;
  message?: string;
}

// Bulk operations
export interface BulkExtendRequest {
  schoolIds: string[];
  newEndDate: string;
  notes?: string;
}

export interface BulkRenewRequest {
  schoolIds: string[];
  planId: string;
  startDate: string;
  endDate: string;
  studentLimit?: number;
  notes?: string;
}

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

export interface CreateDiscountRequest {
  code: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses?: number;
  validFrom: string;
  validUntil?: string;
  applicableTiers?: string[];
  minStudents?: number;
}

export interface UpdateDiscountRequest {
  name?: string;
  description?: string;
  discountValue?: number;
  maxUses?: number;
  validUntil?: string;
  applicableTiers?: string[];
  minStudents?: number;
}

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
