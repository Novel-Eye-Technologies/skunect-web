import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreateFeeStructureRequest = Api['CreateFeeStructureRequest'];
export type RecordPaymentRequest = Api['RecordPaymentRequest'];
export type CancelInvoiceRequest = Api['CancelInvoiceRequest'];

// Response types from generated OpenAPI schemas
export type FeeStructure = Api['FeeStructureResponse'];
export type Invoice = Api['FeeInvoiceResponse'];

// Local-only payment record (not sent to backend) — used by the record-payment dialog
// to model the form's display state. The strict union here is enforced client-side via
// zod; the backend RecordPaymentRequest accepts plain string for paymentMethod.
export interface Payment {
  id: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
  reference: string | null;
  paidAt: string;
  recordedBy: string;
}

// No generated schema — backend reuses CreateFeeStructureRequest for PUT, so this
// hand-written wrapper just adds the optional isActive field for client-side state.
// TODO(SCRUM-63 follow-up): backend should add a dedicated UpdateFeeStructureRequest
// or document that PUT is a full replace.
export interface UpdateFeeStructureRequest extends Partial<CreateFeeStructureRequest> {
  isActive?: boolean;
}

// Query parameter object — allowed to be hand-written per CLAUDE.md.
export interface GenerateInvoicesRequest {
  termId: string;
  classId?: string;
}
