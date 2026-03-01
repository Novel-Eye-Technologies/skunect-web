export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  className: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  note: string | null;
  markedBy: string;
  createdAt: string;
}

export interface BulkAttendanceEntry {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  note?: string;
}

export interface BulkAttendanceRequest {
  classId: string;
  date: string;
  records: BulkAttendanceEntry[];
}

export interface AttendanceSummaryResponse {
  totalDays: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  byDate: { date: string; present: number; absent: number; late: number }[];
}
