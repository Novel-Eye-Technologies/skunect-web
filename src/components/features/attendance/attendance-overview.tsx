'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getAttendanceOverview } from '@/lib/api/attendance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

export function AttendanceOverview() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: overview, isLoading } = useQuery({
    queryKey: ['attendance', 'overview', schoolId, date],
    queryFn: () => getAttendanceOverview(schoolId!, date),
    enabled: !!schoolId && !!date,
    select: (res) => res.data,
  });

  const stats = [
    { label: 'Total Records', value: overview?.totalStudents ?? 0, icon: Users, color: 'text-blue-600' },
    { label: 'Present', value: overview?.presentCount ?? 0, icon: UserCheck, color: 'text-green-600' },
    { label: 'Absent', value: overview?.absentCount ?? 0, icon: UserX, color: 'text-red-600' },
    { label: 'Late', value: overview?.lateCount ?? 0, icon: Clock, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Daily Overview</h3>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-[180px]"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse h-12 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {overview?.attendanceRate !== undefined && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Attendance Rate</span>
                  <span className="text-lg font-bold">{overview.attendanceRate}%</span>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${Math.min(overview.attendanceRate, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {overview?.classSummaries && overview.classSummaries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Per-Class Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overview.classSummaries.map((cls) => (
                    <div key={cls.classId} className="flex items-center justify-between py-1 border-b last:border-0">
                      <span className="font-medium text-sm">{cls.className}</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-600">P: {cls.present}</span>
                        <span className="text-red-600">A: {cls.absent}</span>
                        <span className="text-yellow-600">L: {cls.late}</span>
                        <span className="text-muted-foreground">Total: {cls.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
