export interface MoodEntry {
  id: string;
  studentId: string;
  studentName: string;
  mood: string;
  note: string | null;
  recordedAt: string;
  recordedBy: string;
  recordedByName: string;
}

export interface CreateMoodEntryRequest {
  studentId: string;
  mood: string;
  note?: string;
}

export const MOOD_OPTIONS = [
  'HAPPY',
  'SAD',
  'ANGRY',
  'ANXIOUS',
  'NEUTRAL',
  'EXCITED',
] as const;

export type MoodType = (typeof MOOD_OPTIONS)[number];
