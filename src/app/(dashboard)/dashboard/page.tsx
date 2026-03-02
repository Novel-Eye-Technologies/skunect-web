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
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);

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

      {/* key={currentSchoolId} forces React to remount the dashboard component
          when the user switches schools — critical for cross-school parents where
          currentRole stays 'PARENT' for both schools. Also ensures future API-backed
          dashboards refetch data for the new school. */}
      {currentRole === 'SUPER_ADMIN' && <SuperAdminDashboard />}
      {currentRole === 'ADMIN' && <AdminDashboard key={currentSchoolId} />}
      {currentRole === 'TEACHER' && <TeacherDashboard key={currentSchoolId} />}
      {currentRole === 'PARENT' && <ParentDashboard key={currentSchoolId} />}
    </div>
  );
}
