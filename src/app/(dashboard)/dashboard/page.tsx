'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import { PageHeader } from '@/components/shared/page-header';
import { AdminDashboard } from '@/components/features/dashboard/admin-dashboard';
import { TeacherDashboard } from '@/components/features/dashboard/teacher-dashboard';
import { SuperAdminDashboard } from '@/components/features/dashboard/super-admin-dashboard';
import { ParentDashboard } from '@/components/features/dashboard/parent-dashboard';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const currentRole = useAuthStore((s) => s.currentRole);

  const greeting = user
    ? `Welcome back, ${user.firstName}`
    : 'Welcome back';

  const description =
    currentRole === 'SUPER_ADMIN'
      ? 'Here is an overview of the entire platform.'
      : currentRole === 'PARENT'
        ? 'Here is an overview of your children\'s progress.'
        : 'Here is an overview of your school today.';

  return (
    <div className="space-y-6">
      <PageHeader
        title={greeting}
        description={description}
      />

      {currentRole === 'SUPER_ADMIN' && <SuperAdminDashboard />}
      {currentRole === 'ADMIN' && <AdminDashboard />}
      {currentRole === 'TEACHER' && <TeacherDashboard />}
      {currentRole === 'PARENT' && <ParentDashboard />}
    </div>
  );
}
