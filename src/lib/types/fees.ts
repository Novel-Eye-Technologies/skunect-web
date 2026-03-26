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
  schoolId: string;
  classId: string | null;
  termId: string | null;
  name: string;
  amount: number;
  isMandatory: boolean;
  deadline: string | null;
  breakdown: string | null;
  amountInWords: string | null;
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
