import type { Api } from '@/lib/api/schema';

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

// Request types from generated OpenAPI schemas
export type CreateMoodEntryRequest = Api['CreateMoodEntryRequest'];

export const MOOD_OPTIONS = [
  'HAPPY',
  'SAD',
  'ANGRY',
  'ANXIOUS',
  'NEUTRAL',
  'EXCITED',
] as const;

export type MoodType = (typeof MOOD_OPTIONS)[number];
