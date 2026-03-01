import { HomeworkDetailClient } from '@/components/features/homework/homework-detail-client';

/**
 * Generate a placeholder param so the page is included in the static export.
 * At runtime, CloudFront's SPA fallback (404 → /index.html) handles
 * arbitrary homework IDs — Next.js client-side routing takes over.
 */
export function generateStaticParams() {
  return [{ homeworkId: '_' }];
}

export default function HomeworkDetailPage() {
  return <HomeworkDetailClient />;
}
