'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import {
  GraduationCap,
  Users,
  ClipboardCheck,
  DollarSign,
  FileText,
  Bell,
  HeartPulse,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/stat-card';
import { useAdminDashboard, useAttendanceSummary, useFeeSummary } from '@/lib/hooks/use-dashboard';
import { useActivityFeed } from '@/lib/hooks/use-activity';
import type { ActivityFeedItem } from '@/lib/types/activity';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const activityTypeIcons: Record<string, typeof Activity> = {
  ATTENDANCE: ClipboardCheck,
  HOMEWORK: FileText,
  ANNOUNCEMENT: Bell,
  WELFARE: HeartPulse,
};

const activityTypeColors: Record<string, string> = {
  ATTENDANCE: 'bg-blue-100 text-blue-700',
  HOMEWORK: 'bg-purple-100 text-purple-700',
  ANNOUNCEMENT: 'bg-amber-100 text-amber-700',
  WELFARE: 'bg-emerald-100 text-emerald-700',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminDashboard() {
  const { data: dashboardRes, isLoading: dashboardLoading } = useAdminDashboard();
  const dashboard = dashboardRes?.data;

  // Weekly attendance: current week Mon–Fri
  const { weekFrom, weekTo } = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
    return {
      weekFrom: format(start, 'yyyy-MM-dd'),
      weekTo: format(end, 'yyyy-MM-dd'),
    };
  }, []);

  const { data: attendanceRes, isLoading: attendanceLoading } = useAttendanceSummary(weekFrom, weekTo);
  const attendanceChart = useMemo(() => {
    const breakdown = attendanceRes?.data?.dailyBreakdown ?? [];
    return breakdown.map((d) => ({
      date: DAY_LABELS[parseISO(d.date).getDay()] || d.date,
      present: d.present,
      absent: d.absent,
      late: d.late,
    }));
  }, [attendanceRes]);

  const { data: feeRes, isLoading: feeLoading } = useFeeSummary();
  const feeSummary = feeRes?.data;

  const { data: activityResponse, isLoading: activityLoading } = useActivityFeed(10);
  const activities = activityResponse?.data ?? [];

  const isStatsLoading = dashboardLoading;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isStatsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Students"
              value={dashboard?.activeStudents?.toLocaleString() ?? '0'}
              description="active students"
              icon={GraduationCap}
            />
            <StatCard
              title="Total Teachers"
              value={dashboard?.totalTeachers ?? 0}
              description="active staff"
              icon={Users}
            />
            <StatCard
              title="Attendance Rate"
              value={`${dashboard?.todayAttendanceRate ?? 0}%`}
              description="today"
              icon={ClipboardCheck}
            />
            <StatCard
              title="Outstanding Fees"
              value={`₦${((dashboard?.totalFeesOutstanding ?? 0) / 1_000_000).toFixed(1)}M`}
              description="pending collection"
              icon={DollarSign}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>
              Student attendance overview for this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {attendanceLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : attendanceChart.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No attendance data for this week yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="present"
                      stroke="#2A9D8F"
                      strokeWidth={2}
                      dot={{ fill: '#2A9D8F', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Present"
                    />
                    <Line
                      type="monotone"
                      dataKey="absent"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', r: 4 }}
                      name="Absent"
                    />
                    <Line
                      type="monotone"
                      dataKey="late"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', r: 4 }}
                      name="Late"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fee Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Summary</CardTitle>
            <CardDescription>
              Overall fee collection status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {feeLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : !feeSummary ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No fee data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        label: 'Collected',
                        amount: Number(feeSummary.totalCollected),
                      },
                      {
                        label: 'Outstanding',
                        amount: Number(feeSummary.totalOutstanding),
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="label"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) =>
                        `₦${(value / 1_000_000).toFixed(0)}M`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value) =>
                        `₦${(Number(value) / 1_000_000).toFixed(1)}M`
                      }
                    />
                    <Bar
                      dataKey="amount"
                      radius={[4, 4, 0, 0]}
                      name="Amount"
                      fill="#2A9D8F"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions across the school
            </CardDescription>
          </div>
          <Link
            href="/activity"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 rounded-lg border p-3">
                  <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent activity to show.
            </p>
          ) : (
            <div className="space-y-3">
              {activities.map((item: ActivityFeedItem, index: number) => {
                const Icon = activityTypeIcons[item.type] ?? Activity;
                const colorClass = activityTypeColors[item.type] ?? 'bg-gray-100 text-gray-700';

                return (
                  <div
                    key={`${item.type}-${item.timestamp}-${index}`}
                    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.actorName}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
