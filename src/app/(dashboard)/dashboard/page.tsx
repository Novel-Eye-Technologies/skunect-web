'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { PageHeader } from '@/components/shared/page-header';
import { AdminDashboard } from '@/components/features/dashboard/admin-dashboard';
import { TeacherDashboard } from '@/components/features/dashboard/teacher-dashboard';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const currentRole = useAuthStore((s) => s.currentRole);

  const greeting = user
    ? `Welcome back, ${user.firstName}`
    : 'Welcome back';

  return (
    <div className="space-y-6">
      <PageHeader
        title={greeting}
        description="Here is an overview of your school today."
      />

      {currentRole === 'ADMIN' && <AdminDashboard />}
      {currentRole === 'TEACHER' && <TeacherDashboard />}
    </div>
  );
}
