import type { Api } from '@/lib/api/schema';

// Request/entry types from generated OpenAPI schemas
export type AttendanceEntry = Api['AttendanceEntry'];
export type RecordAttendanceRequest = Api['RecordAttendanceRequest'];

// Response types from generated OpenAPI schemas
export type WelfareResponse = Api['WelfareResponse'];
export type AttendanceRecord = Api['AttendanceResponse'];
export type AttendanceOverviewResponse = Api['AttendanceOverviewResponse'];

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
