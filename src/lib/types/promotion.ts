export interface EligibleStudent {
  studentId: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  averageScore: number;
  eligible: boolean;
}

export interface BulkPromoteRequest {
  fromClassId: string;
  toClassId: string;
  sessionId: string;
  studentIds: string[];
}

export interface PromotionRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  fromClassId: string;
  fromClassName: string;
  toClassId: string;
  toClassName: string;
  sessionId: string;
  status: string;
  remarks: string | null;
  createdAt: string;
}
