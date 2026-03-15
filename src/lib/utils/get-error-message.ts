import { isAxiosError } from 'axios';
import type { ApiResponse } from '@/lib/api/types';

/**
 * Extract a meaningful error message from an API error response.
 * Falls back to the provided default if the error is not an AxiosError
 * or does not contain a structured API response.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;

  const data = error.response?.data as ApiResponse<unknown> | undefined;
  if (!data) return fallback;

  // Field-level validation errors take priority
  if (data.errors?.length) {
    return data.errors.map((e) => e.message).join('. ');
  }

  // Server-provided message (e.g. "Student with this admission number already exists")
  if (data.message) {
    return data.message;
  }

  return fallback;
}
