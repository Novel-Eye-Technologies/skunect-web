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
import { StatCard } from '@/components/shared/stat-card';

// ---------------------------------------------------------------------------
// Mock data - will be replaced with API calls
// ---------------------------------------------------------------------------

const stats = {
  myClasses: 6,
  todayAttendance: 91.5,
  pendingHomework: 4,
};

const classAttendance = [
  { className: 'JSS 1A', present: 38, total: 42, percentage: 90.5 },
  { className: 'JSS 1B', present: 40, total: 42, percentage: 95.2 },
  { className: 'JSS 2A', present: 36, total: 40, percentage: 90.0 },
  { className: 'SS 1A', present: 34, total: 38, percentage: 89.5 },
  { className: 'SS 1B', present: 37, total: 38, percentage: 97.4 },
  { className: 'SS 2A', present: 35, total: 40, percentage: 87.5 },
];

const upcomingAssignments = [
  {
    id: '1',
    title: 'Mathematics CA2 - Algebra',
    className: 'JSS 1A',
    dueDate: 'Tomorrow',
    submissionRate: 72,
    status: 'active' as const,
  },
  {
    id: '2',
    title: 'English Essay - My Holiday',
    className: 'JSS 1B',
    dueDate: 'Mar 3, 2026',
    submissionRate: 45,
    status: 'active' as const,
  },
  {
    id: '3',
    title: 'Physics Lab Report - Optics',
    className: 'SS 1A',
    dueDate: 'Mar 5, 2026',
    submissionRate: 30,
    status: 'active' as const,
  },
  {
    id: '4',
    title: 'Chemistry Worksheet - Periodic Table',
    className: 'SS 2A',
    dueDate: 'Mar 7, 2026',
    submissionRate: 15,
    status: 'upcoming' as const,
  },
];

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  upcoming: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="My Classes"
          value={stats.myClasses}
          description="assigned this term"
          icon={BookOpen}
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats.todayAttendance}%`}
          description="across all classes"
          icon={ClipboardCheck}
          trend={{ value: 1.2, direction: 'up' }}
        />
        <StatCard
          title="Pending Homework"
          value={stats.pendingHomework}
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
            <div className="space-y-4">
              {classAttendance.map((cls) => (
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
            <div className="space-y-3">
              {upcomingAssignments.map((assignment) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
