import { StudentDetailClient } from '@/components/features/students/student-detail-client';

export function generateStaticParams() {
  return [{ studentId: '_' }];
}

export default function StudentDetailPage() {
  return <StudentDetailClient />;
}
