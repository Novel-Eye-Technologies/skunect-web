import { SchoolDetailClient } from '@/components/features/schools/school-detail-client';

export function generateStaticParams() {
  return [{ schoolId: '_' }];
}

export default function SchoolDetailPage() {
  return <SchoolDetailClient />;
}
