export interface WelfareEntry {
  studentId: string;
  status: string;
  notes: string;
}

export interface RecordWelfareRequest {
  classId: string;
  date: string;
  records: WelfareEntry[];
}

export interface WelfareRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  status: string;
  notes: string;
  date: string;
  recordedBy: string;
  createdAt: string;
}
