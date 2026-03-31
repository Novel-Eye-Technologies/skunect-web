import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreateFeeStructureRequest = Api['CreateFeeStructureRequest'];

// Response types from generated OpenAPI schemas
export type FeeStructure = Api['FeeStructureResponse'];
export type Invoice = Api['FeeInvoiceResponse'];

// RecordPaymentRequest — keep hand-written because consumer code
// (school-subscription-client) adds fields not in generated schema.
export interface RecordPaymentRequest {
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
  reference?: string;
}

export interface Payment {
  id: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
  reference: string | null;
  paidAt: string;
  recordedBy: string;
}

// No generated schema — keep hand-written
export interface UpdateFeeStructureRequest extends Partial<CreateFeeStructureRequest> {
  isActive?: boolean;
}

export interface GenerateInvoicesRequest {
  termId: string;
  classId?: string;
}
