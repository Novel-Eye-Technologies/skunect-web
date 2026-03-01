'use client';

import {
  Users,
  GraduationCap,
  Banknote,
  CalendarDays,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { AttendanceAnalytics } from '@/components/features/analytics/attendance-analytics';
import { AcademicAnalytics } from '@/components/features/analytics/academic-analytics';
import { FeeAnalytics } from '@/components/features/analytics/fee-analytics';
import { useDashboard } from '@/lib/hooks/use-analytics';
import { formatCurrencyShort } from '@/lib/utils/format-currency';

export default function AnalyticsPage() {
  const { data: dashboard, isLoading } = useDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Insights and reports across attendance, academics, and fees."
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>

        {/* ----------------------------------------------------------------- */}
        {/* Overview Tab                                                       */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Students"
                value={dashboard?.totalStudents ?? 0}
                icon={Users}
                trend={
                  dashboard?.totalStudents
                    ? { value: 2.5, direction: 'up' }
                    : undefined
                }
                description="Enrolled students"
              />
              <StatCard
                title="Total Teachers"
                value={dashboard?.totalTeachers ?? 0}
                icon={GraduationCap}
                description="Active teachers"
              />
              <StatCard
                title="Attendance Rate"
                value={`${(dashboard?.attendanceRate ?? 0).toFixed(1)}%`}
                icon={CalendarDays}
                trend={
                  dashboard?.attendanceRate
                    ? {
                        value: parseFloat(
                          (dashboard.attendanceRate - 90).toFixed(1),
                        ),
                        direction:
                          dashboard.attendanceRate >= 90 ? 'up' : 'down',
                      }
                    : undefined
                }
                description="This term"
              />
              <StatCard
                title="Fees Collected"
                value={formatCurrencyShort(dashboard?.totalFeesPaid ?? 0)}
                icon={Banknote}
                trend={
                  dashboard?.totalFees
                    ? {
                        value: parseFloat(
                          (
                            ((dashboard.totalFeesPaid ?? 0) /
                              (dashboard.totalFees || 1)) *
                            100
                          ).toFixed(1),
                        ),
                        direction:
                          (dashboard.totalFeesPaid ?? 0) /
                            (dashboard.totalFees || 1) >=
                          0.5
                            ? 'up'
                            : 'down',
                      }
                    : undefined
                }
                description={`of ${formatCurrencyShort(dashboard?.totalFees ?? 0)} invoiced`}
              />
            </div>
          )}
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Attendance Tab                                                     */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="attendance">
          <AttendanceAnalytics />
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Academic Tab                                                       */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="academic">
          <AcademicAnalytics />
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Fees Tab                                                           */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="fees">
          <FeeAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
