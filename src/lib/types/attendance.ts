import type { Api } from '@/lib/api/schema';

// Request/entry types from generated OpenAPI schemas
export type AttendanceEntry = Api['AttendanceEntry'];
export type RecordAttendanceRequest = Api['RecordAttendanceRequest'];

// Response types — generated schemas have all fields optional, keep hand-written
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

export interface AttendanceOverviewResponse {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
}

export interface WelfareResponse {
  id: string;
  studentId: string;
  studentName: string;
  status: string;
  notes: string;
  date: string;
  recordedBy: string;
  createdAt: string;
}

// Aliases used in hand-written code
export type BulkAttendanceEntry = AttendanceEntry;
export type BulkAttendanceRequest = RecordAttendanceRequest;

// No generated schema — keep hand-written
export interface AttendanceSummaryResponse {
  totalDays: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  byDate: { date: string; present: number; absent: number; late: number }[];
}
