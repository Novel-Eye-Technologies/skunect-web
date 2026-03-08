'use client';

import { useRouter } from 'next/navigation';
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Clock,
  Users,
  ArrowRight,
  CalendarCheck,
  GraduationCap,
  BookPlus,
  MessageSquarePlus,
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
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/stat-card';
import { useTeacherDashboard } from '@/lib/hooks/use-dashboard';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  upcoming: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
};

const quickActions = [
  {
    label: 'Take Attendance',
    icon: CalendarCheck,
    href: '/attendance',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
  },
  {
    label: 'Enter Grade',
    icon: GraduationCap,
    href: '/academics',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    label: 'Create Homework',
    icon: BookPlus,
    href: '/homework',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    label: 'Send Message',
    icon: MessageSquarePlus,
    href: '/communication/messages',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
  },
];

export function TeacherDashboard() {
  const router = useRouter();
  const { data: response, isLoading } = useTeacherDashboard();
  const data = response?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Classes"
          value={data?.myClassesCount ?? 0}
          description="assigned this term"
          icon={BookOpen}
        />
        <StatCard
          title="Total Students"
          value={data?.totalStudentsCount ?? 0}
          description={
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-[#2A9D8F] hover:text-[#2A9D8F]/80"
              onClick={() => router.push('/students')}
            >
              View Detail <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          }
          icon={Users}
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

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all hover:shadow-md hover:scale-[1.02] ${action.bgColor}`}
              >
                <action.icon className={`h-6 w-6 ${action.color}`} />
                <span className="text-sm font-medium text-foreground">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <CardDescription>Your classes and periods for today</CardDescription>
          </CardHeader>
          <CardContent>
            {!data?.dailySchedule?.length ? (
              <p className="text-sm text-muted-foreground">
                No schedule for today.
              </p>
            ) : (
              <div className="space-y-3">
                {data.dailySchedule.map((item) => (
                  <div
                    key={item.periodNumber}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2A9D8F]/10 text-sm font-bold text-[#2A9D8F]">
                      P{item.periodNumber}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.label ?? item.subjectName ?? 'Free Period'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.className}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {item.startTime} - {item.endTime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.durationMinutes} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
      </div>

      {/* Upcoming Assignments - full width */}
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
