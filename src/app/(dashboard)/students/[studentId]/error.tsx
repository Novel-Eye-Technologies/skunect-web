'use client';

import { StudentDetailClient } from '@/components/features/students/student-detail-client';

/**
 * Segment-level error boundary for the student detail page.
 *
 * In the static export environment, client-side navigation via router.push()
 * to /students/<uuid> may trigger a Next.js route reconciliation error because
 * the only pre-rendered param is '_' (from generateStaticParams).  The RSC data
 * served by nginx carries paramKey='_' which mismatches the actual UUID in the URL.
 *
 * This error boundary catches that error and falls back to rendering the detail
 * client directly.  StudentDetailClient already has a usePathname() fallback
 * that extracts the real student ID from the URL, so it works correctly.
 */
export default function StudentDetailError({
  error: _error,
  reset: _reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <StudentDetailClient />;
}
