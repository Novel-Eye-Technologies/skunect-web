'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  GraduationCap,
  Users,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/shared/stat-card';
import { getSystemDashboard } from '@/lib/api/admin';
import type { SystemDashboardResponse } from '@/lib/types/admin';

export function SuperAdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<SystemDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const response = await getSystemDashboard();
        if (response.status === 'SUCCESS') {
          setData(response.data);
        } else {
          setError(response.message ?? 'Failed to load dashboard');
        }
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{error ?? 'No data available'}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Schools"
          value={data.totalSchools}
          description="registered schools"
          icon={Building2}
        />
        <StatCard
          title="Total Students"
          value={data.totalStudents.toLocaleString()}
          description="across all schools"
          icon={GraduationCap}
        />
        <StatCard
          title="Total Teachers"
          value={data.totalTeachers}
          description="active teaching staff"
          icon={Users}
        />
        <StatCard
          title="Total Parents"
          value={data.totalParents}
          description="registered parents"
          icon={UserCheck}
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          description="platform-wide"
          icon={Users}
        />
        <StatCard
          title="School Admins"
          value={data.totalAdmins}
          description="managing schools"
          icon={UserCheck}
        />
        <StatCard
          title="Active Sessions"
          value={data.activeAcademicSessions}
          description="academic sessions"
          icon={Building2}
        />
      </div>

      {/* Schools Overview Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Schools Overview</CardTitle>
            <CardDescription>
              All registered schools and their statistics
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/system/schools')}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.schoolSummaries.map((school) => (
              <div
                key={school.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2A9D8F]/10">
                    <Building2 className="h-5 w-5 text-[#2A9D8F]" />
                  </div>
                  <div>
                    <p className="font-medium">{school.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {school.city}, {school.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{school.studentCount}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{school.teacherCount}</p>
                    <p className="text-xs text-muted-foreground">Teachers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{school.adminCount}</p>
                    <p className="text-xs text-muted-foreground">Admins</p>
                  </div>
                  <Badge variant={school.isActive ? 'default' : 'secondary'}>
                    {school.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}

            {data.schoolSummaries.length === 0 && (
              <p className="py-6 text-center text-muted-foreground">
                No schools registered yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>System management shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/system/schools')}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Manage Schools
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/system/seed')}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Seed Data Management
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
