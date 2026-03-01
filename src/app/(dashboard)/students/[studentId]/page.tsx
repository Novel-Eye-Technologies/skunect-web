import { StudentDetailClient } from '@/components/features/students/student-detail-client';

/**
 * Generate a placeholder param so the page is included in the static export.
 * At runtime, CloudFront's SPA fallback (404 → /index.html) handles
 * arbitrary student IDs — Next.js client-side routing takes over.
 */
export function generateStaticParams() {
  return [{ studentId: '_' }];
}

export default function StudentDetailPage() {
  return <StudentDetailClient />;
}
