'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CalendarDays, Users, UserX, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/stat-card';
import { useAttendanceSummary } from '@/lib/hooks/use-analytics';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/lib/api/school-settings';

const COLORS = {
  present: 'var(--color-teal)',
  absent: '#ef4444',
  late: '#f59e0b',
};

export function AttendanceAnalytics() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [classId, setClassId] = useState('');

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const classes = classesResponse ?? [];

  const { data, isLoading } = useAttendanceSummary({
    from: startDate || undefined,
    to: endDate || undefined,
    classId: classId || undefined,
  });

  const dailyTrend = data?.dailyTrend ?? [];

  const pieData = data
    ? [
        { name: 'Present', value: data.presentCount, color: COLORS.present },
        { name: 'Absent', value: data.absentCount, color: COLORS.absent },
        { name: 'Late', value: data.lateCount, color: COLORS.late },
      ]
    : [];

  if (isLoading) {
    return <AttendanceAnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="att-start-date">Start Date</Label>
            <Input
              id="att-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="att-end-date">End Date</Label>
            <Input
              id="att-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Class</Label>
            <Select
              value={classId}
              onValueChange={(v) => setClassId(v === 'ALL' ? '' : v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                    {cls.gradeLevel ? ` (${cls.gradeLevel})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={data?.totalStudents ?? 0}
          icon={Users}
        />
        <StatCard
          title="Attendance Rate"
          value={`${(data?.averageAttendance ?? 0).toFixed(1)}%`}
          icon={CalendarDays}
          description="Average attendance"
        />
        <StatCard
          title="Absent Count"
          value={data?.absentCount ?? 0}
          icon={UserX}
        />
        <StatCard
          title="Late Count"
          value={data?.lateCount ?? 0}
          icon={Clock}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Chart - Daily Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Daily Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyTrend.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No attendance data available for the selected period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="present"
                    name="Present"
                    stroke={COLORS.present}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="absent"
                    name="Absent"
                    stroke={COLORS.absent}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="late"
                    name="Late"
                    stroke={COLORS.late}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.every((d) => d.value === 0) ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AttendanceAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[380px] rounded-lg lg:col-span-2" />
        <Skeleton className="h-[380px] rounded-lg" />
      </div>
    </div>
  );
}
