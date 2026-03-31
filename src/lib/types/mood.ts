import type { Api } from '@/lib/api/schema';

// Response types from generated OpenAPI schemas
export type MoodEntry = Api['MoodEntryResponse'];

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
