import { ClassDetailClient } from '@/components/features/academics/class-detail-client';

export function generateStaticParams() {
  return [{ classId: '_' }];
}

export default function ClassDetailPage() {
  return <ClassDetailClient />;
}
