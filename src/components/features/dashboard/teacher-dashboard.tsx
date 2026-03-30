'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  ClipboardCheck,
  BookOpen,
  MessageSquare,
  Users,
  AlertTriangle,
  GraduationCap,
  CheckCircle,
  TrendingDown,
  TrendingUp,
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
import { useAuthStore } from '@/lib/stores/auth-store';
import { getEnhancedTeacherDashboard } from '@/lib/api/dashboard';
import type { EnhancedTeacherDashboard } from '@/lib/types/dashboard';

// ── Helpers ──

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

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ── Component ──

export function TeacherDashboard() {
  const router = useRouter();
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);

  const [data, setData] = useState<EnhancedTeacherDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!currentSchoolId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getEnhancedTeacherDashboard(currentSchoolId);
      setData(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSchoolId]);

  // ── Loading ──

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Schedule skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-44 shrink-0 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Stat cards skeleton */}
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
        {/* Rest skeleton */}
        <Card>
          <CardContent className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Error ──

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={fetchData}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  // ── Determine current period (rough heuristic: period index by order) ──
  const now = new Date();
  const currentHour = now.getHours();
  // Simple heuristic: school runs 8am-3pm, ~7 periods, first period at hour 8
  const estimatedPeriod = Math.max(
    1,
    Math.min(data.todaySchedule.length, currentHour - 7),
  );

  return (
    <div className="space-y-6">
      {/* ── Row 1: Today's Schedule ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-teal" />
            Today&apos;s Schedule
          </CardTitle>
          <CardDescription>
            {data.todaySchedule.length} period
            {data.todaySchedule.length !== 1 ? 's' : ''} today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.todaySchedule.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No classes scheduled for today.
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {data.todaySchedule.map((slot) => {
                const isCurrent = slot.periodNumber === estimatedPeriod;
                const isNext = slot.periodNumber === estimatedPeriod + 1;
                const needsAttendance = !slot.attendanceMarked;

                return (
                  <div
                    key={slot.periodNumber}
                    className={`flex-shrink-0 w-44 rounded-lg border-2 p-3 transition-all ${
                      isCurrent
                        ? 'border-teal bg-teal/5 ring-1 ring-teal/20'
                        : isNext
                          ? 'border-blue-300 bg-blue-50/50'
                          : needsAttendance
                            ? 'border-amber-300 bg-amber-50/30'
                            : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Period {slot.periodNumber}
                      </span>
                      {slot.isHomeroom && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          Homeroom
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {slot.subjectName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {slot.className}
                    </p>
                    {needsAttendance && (
                      <div className="mt-2 flex items-center gap-1 text-amber-600">
                        <ClipboardCheck className="h-3 w-3" />
                        <span className="text-[10px] font-medium">
                          Mark Attendance
                        </span>
                      </div>
                    )}
                    {slot.attendanceMarked && (
                      <div className="mt-2 flex items-center gap-1 text-emerald-600">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-[10px] font-medium">Done</span>
                      </div>
                    )}
                    {isCurrent && (
                      <Badge className="mt-2 bg-teal text-white text-[10px]">
                        Current
                      </Badge>
                    )}
                    {isNext && (
                      <Badge
                        variant="outline"
                        className="mt-2 text-[10px] border-blue-300 text-blue-600"
                      >
                        Up Next
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Row 2: Quick Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Attendance */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Today&apos;s Attendance
                </p>
                <p
                  className={`text-3xl font-bold tracking-tight ${rateColor(data.todayAttendanceRate, 80)}`}
                >
                  {data.todayAttendanceRate}%
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-600">
                    {data.todayPresentCount} present
                  </span>{' '}
                  /{' '}
                  <span className="text-red-500">
                    {data.todayAbsentCount} absent
                  </span>{' '}
                  /{' '}
                  <span className="text-amber-500">
                    {data.todayLateCount} late
                  </span>
                </p>
              </div>
              <div className="rounded-lg bg-teal/10 p-3">
                <ClipboardCheck className="h-5 w-5 text-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Homework to Grade */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Homework to Grade
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {data.pendingHomeworkToGrade}
                </p>
                {data.overdueHomeworkCount > 0 ? (
                  <p className="text-xs text-red-500">
                    {data.overdueHomeworkCount} overdue
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">All on track</p>
                )}
              </div>
              <div className="rounded-lg bg-teal/10 p-3">
                <BookOpen className="h-5 w-5 text-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent Messages */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Parent Messages
                </p>
                <p
                  className={`text-3xl font-bold tracking-tight ${data.unansweredParentMessages > 0 ? 'text-amber-500' : ''}`}
                >
                  {data.unansweredParentMessages}
                </p>
                <p className="text-xs text-muted-foreground">
                  unanswered &gt;24h
                </p>
              </div>
              <div className="rounded-lg bg-teal/10 p-3">
                <MessageSquare className="h-5 w-5 text-teal" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Students */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  My Students
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {data.totalStudentsCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  across {data.myClassesCount} class
                  {data.myClassesCount !== 1 ? 'es' : ''}
                </p>
              </div>
              <div className="rounded-lg bg-teal/10 p-3">
                <Users className="h-5 w-5 text-teal" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: At-Risk Students ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Students Needing Attention
          </CardTitle>
          <CardDescription>
            Students flagged based on attendance, homework, and grades
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.atRiskStudents.length === 0 ? (
            <div className="flex items-center gap-3 py-6 justify-center text-emerald-600">
              <CheckCircle className="h-6 w-6" />
              <p className="text-sm font-medium">
                All students are on track
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Student</th>
                    <th className="pb-2 pr-4 font-medium">Class</th>
                    <th className="pb-2 pr-4 font-medium text-right">
                      Attendance
                    </th>
                    <th className="pb-2 pr-4 font-medium text-right">
                      Homework
                    </th>
                    <th className="pb-2 pr-4 font-medium text-right">
                      Avg Score
                    </th>
                    <th className="pb-2 font-medium">Risk Factors</th>
                  </tr>
                </thead>
                <tbody>
                  {data.atRiskStudents.slice(0, 5).map((student) => {
                    const isHighRisk = student.riskScore >= 70;
                    const rowBg = isHighRisk
                      ? 'bg-red-50/50'
                      : 'bg-amber-50/50';

                    return (
                      <tr
                        key={student.studentId}
                        className={`border-b last:border-0 ${rowBg}`}
                      >
                        <td className="py-2.5 pr-4 font-medium">
                          {student.studentName}
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {student.className}
                        </td>
                        <td
                          className={`py-2.5 pr-4 text-right font-medium ${rateColor(student.attendanceRate, 80)}`}
                        >
                          {student.attendanceRate}%
                        </td>
                        <td
                          className={`py-2.5 pr-4 text-right font-medium ${rateColor(student.homeworkCompletionRate, 70)}`}
                        >
                          {student.homeworkCompletionRate}%
                        </td>
                        <td className="py-2.5 pr-4 text-right font-medium">
                          {student.avgScore !== null ? (
                            <span className="flex items-center justify-end gap-1">
                              {student.avgScore}%
                              {student.scoreTrend !== null &&
                                student.scoreTrend !== 0 && (
                                  <span>
                                    {student.scoreTrend > 0 ? (
                                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3 text-red-500" />
                                    )}
                                  </span>
                                )}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </td>
                        <td className="py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {student.riskFactors.map((factor) => (
                              <Badge
                                key={factor}
                                variant="outline"
                                className={`text-[10px] ${
                                  isHighRisk
                                    ? 'border-red-300 text-red-700 bg-red-50'
                                    : 'border-amber-300 text-amber-700 bg-amber-50'
                                }`}
                              >
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Row 4: Pending Grading + Recent Assignments ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Grading */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-teal" />
              Pending Grading
            </CardTitle>
            <CardDescription>
              Homework assignments with ungraded submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.pendingGrading.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No homework awaiting grading.
              </p>
            ) : (
              <div className="space-y-3">
                {data.pendingGrading.slice(0, 5).map((hw) => (
                  <button
                    key={hw.homeworkId}
                    onClick={() =>
                      router.push(`/homework/${hw.homeworkId}`)
                    }
                    className="w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {hw.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {hw.className} &middot; {hw.subjectName}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        Due {formatDate(hw.dueDate)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {hw.submittedCount}/{hw.totalStudents} submitted
                      </span>
                      <span
                        className={
                          hw.gradedCount < hw.submittedCount
                            ? 'text-amber-500 font-medium'
                            : ''
                        }
                      >
                        {hw.gradedCount} graded
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal" />
              Recent Assignments
            </CardTitle>
            <CardDescription>
              Last 5 homework you assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No recent assignments.
              </p>
            ) : (
              <div className="space-y-3">
                {data.recentAssignments.slice(0, 5).map((hw) => {
                  const submissionRate =
                    hw.totalStudents > 0
                      ? Math.round(
                          (hw.submittedCount / hw.totalStudents) * 100,
                        )
                      : 0;

                  return (
                    <div
                      key={hw.homeworkId}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {hw.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {hw.className} &middot; Due{' '}
                            {formatDate(hw.dueDate)}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground ml-2">
                          {submissionRate}%
                        </span>
                      </div>
                      <Progress
                        value={submissionRate}
                        className="mt-2 h-1.5"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 5: Class Performance ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-teal" />
            Class Performance
          </CardTitle>
          <CardDescription>
            Overview of all your classes this term
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.classPerformance.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No class data available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Class</th>
                    <th className="pb-2 pr-4 font-medium text-right">
                      Students
                    </th>
                    <th className="pb-2 pr-4 font-medium text-right">
                      Attendance
                    </th>
                    <th className="pb-2 pr-4 font-medium text-right">
                      Homework
                    </th>
                    <th className="pb-2 pr-4 font-medium text-right">
                      Avg Score
                    </th>
                    <th className="pb-2 font-medium text-right">At-Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {data.classPerformance.map((cls) => (
                    <tr
                      key={cls.classId}
                      className="border-b last:border-0"
                    >
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{cls.className}</span>
                          {cls.isHomeroom && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              Homeroom
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-muted-foreground">
                        {cls.studentCount}
                      </td>
                      <td className="py-2.5 pr-4 text-right">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-medium border ${rateBg(cls.attendanceRate, 80)} ${rateColor(cls.attendanceRate, 80)}`}
                        >
                          {cls.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-medium border ${rateBg(cls.homeworkSubmissionRate, 70)} ${rateColor(cls.homeworkSubmissionRate, 70)}`}
                        >
                          {cls.homeworkSubmissionRate}%
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right font-medium">
                        {cls.avgScore !== null ? `${cls.avgScore}%` : '--'}
                      </td>
                      <td className="py-2.5 text-right">
                        {cls.atRiskCount > 0 ? (
                          <span className="text-red-500 font-medium">
                            {cls.atRiskCount}
                          </span>
                        ) : (
                          <span className="text-emerald-600">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
