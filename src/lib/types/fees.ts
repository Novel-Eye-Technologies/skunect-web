import type { Api } from '@/lib/api/schema';

// Request types from generated OpenAPI schemas
export type CreateFeeStructureRequest = Api['CreateFeeStructureRequest'];

// RecordPaymentRequest — keep hand-written because consumer code
// (school-subscription-client) adds fields like paymentType, paymentReference,
// studentsAdded, description that are not in the generated schema.
export interface RecordPaymentRequest {
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
  reference?: string;
}

// Response types — generated schemas have all fields optional, keep hand-written
export interface FeeStructure {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  classId: string | null;
  className: string | null;
  termId: string | null;
  termName: string | null;
  sessionId: string | null;
  sessionName: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  feeStructureId: string;
  feeStructureName: string;
  amount: number;
  amountPaid: number;
  balance: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  dueDate: string;
  payments: Payment[];
  createdAt: string;
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
