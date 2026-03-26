import type { Api } from '@/lib/api/schema';

export interface TimetableConfig {
  id: string;
  schoolId: string;
  sessionId: string;
  periodsPerDay: number;
  periodDuration: number;
  startTime: string;
  breakAfter: number | null;
  breakDuration: number | null;
  days: string[];
}

export interface TimetableSlot {
  id: string;
  classId: string;
  subjectId: string | null;
  teacherId: string | null;
  sessionId: string;
  dayOfWeek: string;
  periodNumber: number;
  label: string | null;
}

// Request types from generated OpenAPI schemas
export type CreateTimetableSlotRequest = Api['TimetableSlotRequest'];
export type TimetableConfigRequest = Api['TimetableConfigRequest'];
