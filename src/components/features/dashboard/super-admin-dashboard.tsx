'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Activity,
  Clock,
  CreditCard,
  BookOpen,
  MessageSquare,
  UserCheck,
  Users,
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
import { Skeleton } from '@/components/ui/skeleton';
import { getSystemDashboard } from '@/lib/api/admin';
import type { SystemDashboardResponse, DashboardAlert } from '@/lib/types/admin';

function formatNaira(value: number): string {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(0)}K`;
  return `₦${value.toLocaleString()}`;
}

function formatRate(value: number): string {
  return `${value.toFixed(1)}%`;
}

function rateColor(value: number, target: number): string {
  if (value >= target) return 'text-emerald-600';
  if (value >= target * 0.6) return 'text-amber-500';
  return 'text-red-500';
}

function rateBg(value: number, target: number): string {
  if (value >= target) return 'bg-emerald-50 border-emerald-200';
  if (value >= target * 0.6) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

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
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{error ?? 'No data available'}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Hero Metrics ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-teal">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal/10 p-2.5">
                <Building2 className="h-5 w-5 text-teal" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Schools</p>
                <p className="text-3xl font-bold">{data.activeSchools}</p>
                <p className="text-xs text-muted-foreground">{data.totalSchools} registered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-navy">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy/10 p-2.5">
                <GraduationCap className="h-5 w-5 text-navy" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-3xl font-bold">{data.totalStudents.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{data.totalTeachers} teachers, {data.totalParents} parents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#E9C46A]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#E9C46A]/10 p-2.5">
                <TrendingUp className="h-5 w-5 text-[#E9C46A]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MRR (Monthly Recurring Revenue)</p>
                <p className="text-3xl font-bold">{formatNaira(data.mrr)}</p>
                <p className="text-xs text-muted-foreground">{formatNaira(data.revenuePerStudent)}/student</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Growth Metrics ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <Building2 className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Fully Set Up</p>
            <p className="text-2xl font-bold">{data.fullySetUpSchools} <span className="text-sm font-normal text-muted-foreground">/ {data.activeSchools}</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Clock className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Avg Days to First Attendance</p>
            <p className="text-2xl font-bold">{data.avgDaysToFirstAttendance != null ? `${data.avgDaysToFirstAttendance}d` : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Net Student Growth</p>
            <p className={`text-2xl font-bold ${data.netStudentGrowth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {data.netStudentGrowth >= 0 ? '+' : ''}{data.netStudentGrowth}
            </p>
            <p className="text-xs text-muted-foreground">+{data.studentsAddedThisMonth} / -{data.studentsRemovedThisMonth} this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <UserCheck className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Parent Activation</p>
            <p className={`text-2xl font-bold ${rateColor(data.parentActivationRate, 60)}`}>
              {formatRate(data.parentActivationRate)}
            </p>
            <p className="text-xs text-muted-foreground">Target: 60% within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Health Gauges ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className={`border ${rateBg(data.teacherAttendanceRate, 80)}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teacher Attendance Today</p>
                <p className={`text-4xl font-bold ${rateColor(data.teacherAttendanceRate, 80)}`}>
                  {formatRate(data.teacherAttendanceRate)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Target: 80%</p>
              </div>
              <Activity className={`h-8 w-8 ${rateColor(data.teacherAttendanceRate, 80)}`} />
            </div>
          </CardContent>
        </Card>

        <Card className={`border ${rateBg(data.weeklyActiveParentRate, 50)}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Active Parents</p>
                <p className={`text-4xl font-bold ${rateColor(data.weeklyActiveParentRate, 50)}`}>
                  {formatRate(data.weeklyActiveParentRate)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Target: 50%</p>
              </div>
              <UserCheck className={`h-8 w-8 ${rateColor(data.weeklyActiveParentRate, 50)}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Alerts ── */}
      {data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alerts ({data.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.alerts.map((alert: DashboardAlert, i: number) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  alert.severity === 'danger'
                    ? 'border-red-200 bg-red-50'
                    : alert.severity === 'warning'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-blue-200 bg-blue-50'
                }`}
              >
                {alert.severity === 'danger' ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                )}
                <div>
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Revenue & Engagement ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <CreditCard className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">{formatNaira(data.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Clock className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-bold text-amber-600">{formatNaira(data.totalOutstanding)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <BookOpen className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Homework Completion</p>
            <p className="text-2xl font-bold">{formatRate(data.homeworkCompletionRate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <MessageSquare className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Messages Today</p>
            <p className="text-2xl font-bold">{data.messagesToday}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Subscription Status ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-emerald-600">{data.activeSubscriptions}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-amber-500">{data.gracePeriodSubscriptions}</p>
            <p className="text-sm text-muted-foreground">Grace Period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-red-500">{data.expiredSubscriptions}</p>
            <p className="text-sm text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Schools Table ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Schools</CardTitle>
            <CardDescription>Health overview per school</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/system/schools')}>
            Manage
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">School</th>
                  <th className="pb-3 font-medium text-right">Students</th>
                  <th className="pb-3 font-medium text-right">Attendance</th>
                  <th className="pb-3 font-medium text-right">Fee Collection</th>
                  <th className="pb-3 font-medium text-right">Msgs/wk</th>
                  <th className="pb-3 font-medium text-right">Parent Act.</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.schoolSummaries.map((school) => (
                  <tr key={school.id} className="hover:bg-muted/50">
                    <td className="py-3">
                      <p className="font-medium">{school.name}</p>
                      <p className="text-xs text-muted-foreground">{school.city}, {school.state}</p>
                    </td>
                    <td className="py-3 text-right">
                      <p className="font-medium">{school.studentCount}</p>
                      <p className="text-xs text-muted-foreground">{school.teacherCount}T / {school.parentCount}P</p>
                    </td>
                    <td className="py-3 text-right">
                      <p className={`font-medium ${rateColor(school.todayAttendanceRate, 80)}`}>
                        {school.todayAttendanceRate > 0 ? formatRate(school.todayAttendanceRate) : '—'}
                      </p>
                    </td>
                    <td className="py-3 text-right">
                      <p className={`font-medium ${rateColor(school.feeCollectionRate, 70)}`}>
                        {school.feeCollectionRate > 0 ? formatRate(school.feeCollectionRate) : '—'}
                      </p>
                    </td>
                    <td className="py-3 text-right">
                      <p className="font-medium">{school.messagesThisWeek}</p>
                    </td>
                    <td className="py-3 text-right">
                      <p className={`font-medium ${rateColor(school.parentActivationRate, 60)}`}>
                        {school.parentActivationRate > 0 ? formatRate(school.parentActivationRate) : '—'}
                      </p>
                    </td>
                    <td className="py-3 text-center">
                      {school.subscriptionStatus ? (
                        <Badge
                          variant={
                            school.subscriptionStatus === 'ACTIVE' ? 'default' :
                            school.subscriptionStatus === 'GRACE_PERIOD' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {school.subscriptionStatus.replace('_', ' ')}
                          {school.daysUntilExpiry != null && school.daysUntilExpiry <= 30 && (
                            <span className="ml-1">({school.daysUntilExpiry}d)</span>
                          )}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No sub</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-xs text-muted-foreground">
                      {school.lastActivityAt
                        ? new Date(school.lastActivityAt).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
                {data.schoolSummaries.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No schools registered yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Actions ── */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => router.push('/system/schools')}>
              <Building2 className="mr-2 h-4 w-4" />
              Manage Schools
            </Button>
            <Button variant="outline" onClick={() => router.push('/system/subscription-dashboard')}>
              <CreditCard className="mr-2 h-4 w-4" />
              Subscriptions
            </Button>
            <Button variant="outline" onClick={() => router.push('/system/super-admins')}>
              <Users className="mr-2 h-4 w-4" />
              Super Admins
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
