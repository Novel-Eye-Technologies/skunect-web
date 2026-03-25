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

export interface CreateFeeStructureRequest {
  name: string;
  amount: number;
  termId?: string;
  classId?: string;
  isMandatory?: boolean;
  deadline?: string;
  breakdown?: string;
}

export interface UpdateFeeStructureRequest extends Partial<CreateFeeStructureRequest> {}

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

export interface GenerateInvoicesRequest {
  termId: string;
  classId?: string;
}

export interface RecordPaymentRequest {
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
  reference?: string;
}
