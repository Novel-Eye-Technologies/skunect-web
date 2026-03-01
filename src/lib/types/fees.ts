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

export interface CreateFeeStructureRequest {
  name: string;
  description?: string;
  amount: number;
  classId?: string;
  termId?: string;
  sessionId?: string;
}

export interface UpdateFeeStructureRequest extends Partial<CreateFeeStructureRequest> {
  isActive?: boolean;
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

export interface GenerateInvoicesRequest {
  feeStructureId: string;
  classId: string;
}

export interface RecordPaymentRequest {
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
  reference?: string;
}
