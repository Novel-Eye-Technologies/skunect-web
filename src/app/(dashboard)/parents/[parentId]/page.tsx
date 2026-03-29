import { ParentDetailClient } from '@/components/features/parents/parent-detail-client';

export function generateStaticParams() {
  return [{ parentId: '_' }];
}

export default function ParentDetailPage() {
  return <ParentDetailClient />;
}
