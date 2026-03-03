'use client';

import { HomeworkDetailClient } from '@/components/features/homework/homework-detail-client';

/**
 * Segment-level error boundary for the homework detail page.
 *
 * In the static export environment, client-side navigation via router.push()
 * to /homework/<uuid> may trigger a Next.js route reconciliation error because
 * the only pre-rendered param is '_' (from generateStaticParams).  The RSC data
 * served by nginx carries paramKey='_' which mismatches the actual UUID in the URL.
 *
 * This error boundary catches that error and falls back to rendering the detail
 * client directly.  HomeworkDetailClient already has a usePathname() fallback
 * that extracts the real homework ID from the URL, so it works correctly.
 */
export default function HomeworkDetailError() {
  return <HomeworkDetailClient />;
}
