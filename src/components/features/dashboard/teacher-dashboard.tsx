'use client';

import { BookOpen, ClipboardCheck, FileText, Clock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/stat-card';
import { useTeacherDashboard } from '@/lib/hooks/use-dashboard';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  upcoming: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
};

export function TeacherDashboard() {
  const { data: response, isLoading } = useTeacherDashboard();
  const data = response?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="My Classes"
          value={data?.myClassesCount ?? 0}
          description="assigned this term"
          icon={BookOpen}
        />
        <StatCard
          title="Today's Attendance"
          value={`${data?.todayAttendanceRate ?? 0}%`}
          description="across all classes"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Pending Homework"
          value={data?.pendingHomeworkCount ?? 0}
          description="assignments to review"
          icon={FileText}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Class Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Class Attendance Today</CardTitle>
            <CardDescription>
              Attendance rate for each of your classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!data?.classAttendance?.length ? (
              <p className="text-sm text-muted-foreground">
                No attendance data for today.
              </p>
            ) : (
              <div className="space-y-4">
                {data.classAttendance.map((cls) => (
                  <div key={cls.className} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {cls.className}
                      </span>
                      <span className="text-muted-foreground">
                        {cls.present}/{cls.total} ({cls.percentage}%)
                      </span>
                    </div>
                    <Progress
                      value={cls.percentage}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>
              Homework and assignments requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!data?.upcomingAssignments?.length ? (
              <p className="text-sm text-muted-foreground">
                No upcoming assignments.
              </p>
            ) : (
              <div className="space-y-3">
                {data.upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {assignment.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                        >
                          {assignment.className}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${statusColors[assignment.status] ?? ''}`}
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {assignment.dueDate}
                        </span>
                        <span>
                          {assignment.submissionRate}% submitted
                        </span>
                      </div>
                      <Progress
                        value={assignment.submissionRate}
                        className="mt-1.5 h-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
