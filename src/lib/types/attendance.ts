import type { Api } from '@/lib/api/schema';

// Request/entry types from generated OpenAPI schemas
export type AttendanceEntry = Api['AttendanceEntry'];
export type RecordAttendanceRequest = Api['RecordAttendanceRequest'];

// Response types from generated OpenAPI schemas
export type WelfareResponse = Api['WelfareResponse'];
export type AttendanceRecord = Api['AttendanceResponse'];
export type AttendanceOverviewResponse = Api['AttendanceOverviewResponse'];
export type AttendanceSummaryResponse = Api['AttendanceSummary'];

// Aliases used in hand-written code
export type BulkAttendanceEntry = AttendanceEntry;
export type BulkAttendanceRequest = RecordAttendanceRequest;
