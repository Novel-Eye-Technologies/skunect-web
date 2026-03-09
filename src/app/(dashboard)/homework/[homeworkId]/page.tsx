import { HomeworkDetailClient } from '@/components/features/homework/homework-detail-client';

export function generateStaticParams() {
  return [{ homeworkId: '_' }];
}

export default function HomeworkDetailPage() {
  return <HomeworkDetailClient />;
}
