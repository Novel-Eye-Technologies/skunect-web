import { TeacherDetailClient } from '@/components/features/teachers/teacher-detail-client';

export function generateStaticParams() {
  return [{ teacherId: '_' }];
}

export default function TeacherDetailPage() {
  return <TeacherDetailClient />;
}
