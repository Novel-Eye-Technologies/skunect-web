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

export interface CreateTimetableSlotRequest {
  classId: string;
  subjectId?: string;
  teacherId?: string;
  sessionId: string;
  dayOfWeek: string;
  periodNumber: number;
  label?: string;
}

export interface TimetableConfigRequest {
  sessionId: string;
  periodsPerDay?: number;
  periodDuration?: number;
  startTime?: string;
  breakAfter?: number;
  breakDuration?: number;
  days?: string[];
}
