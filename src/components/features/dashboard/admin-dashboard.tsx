'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  MessageSquare,
  CreditCard,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  ClipboardCheck,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getEnhancedAdminDashboard } from '@/lib/api/dashboard';
import type {
  EnhancedAdminDashboard,
  AdminDashboardAlert,
} from '@/lib/types/dashboard';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Phase = 'RESUMPTION' | 'MID_TERM' | 'EXAM' | 'END_OF_TERM';

const PHASE_LABELS: Record<Phase, string> = {
  RESUMPTION: 'Resumption',
  MID_TERM: 'Mid-Term',
  EXAM: 'Exam',
  END_OF_TERM: 'End of Term',
};

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

function formatRate(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatNaira(value: number): string {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(0)}K`;
  return `₦${value.toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminDashboard() {
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);
  const [phase, setPhase] = useState<Phase>('MID_TERM');
  const [data, setData] = useState<EnhancedAdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentSchoolId) return;

    let cancelled = false;

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);
        const response = await getEnhancedAdminDashboard(currentSchoolId!, phase);
        if (cancelled) return;
        if (response.status === 'SUCCESS') {
          setData(response.data);
        } else {
          setError(response.message ?? 'Failed to load dashboard');
        }
      } catch {
        if (!cancelled) setError('Failed to load dashboard data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, [currentSchoolId, phase]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-md" />
          ))}
        </div>
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
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-14" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──
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

  const teacherAccountabilityRate =
    data.totalTeachersWithClasses > 0
      ? (data.teachersMarkedAttendance / data.totalTeachersWithClasses) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* ── Phase Toggle ── */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(PHASE_LABELS) as Phase[]).map((p) => (
          <Button
            key={p}
            variant={phase === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPhase(p)}
          >
            {PHASE_LABELS[p]}
          </Button>
        ))}
      </div>

      {/* ── Row 1: Hero Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Attendance */}
        <Card className={`border ${rateBg(data.todayAttendanceRate, 80)}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal/10 p-2.5">
                <ClipboardCheck className="h-5 w-5 text-teal" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today&apos;s Attendance</p>
                <p className={`text-3xl font-bold ${rateColor(data.todayAttendanceRate, 80)}`}>
                  {formatRate(data.todayAttendanceRate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.todayPresentCount} present &middot; {data.todayAbsentCount} absent &middot; {data.todayLateCount} late
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Accountability */}
        <Card className={`border ${rateBg(teacherAccountabilityRate, 80)}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy/10 p-2.5">
                <Users className="h-5 w-5 text-navy" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teacher Accountability</p>
                <p className={`text-3xl font-bold ${rateColor(teacherAccountabilityRate, 80)}`}>
                  {data.teachersMarkedAttendance}/{data.totalTeachersWithClasses}
                </p>
                <p className="text-xs text-muted-foreground">
                  teachers marked attendance today
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent Messages */}
        <Card className={`border ${data.unansweredParentMessages > 0 ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${data.unansweredParentMessages > 0 ? 'bg-red-100' : 'bg-emerald-100'}`}>
                <MessageSquare className={`h-5 w-5 ${data.unansweredParentMessages > 0 ? 'text-red-500' : 'text-emerald-600'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parent Messages</p>
                <p className={`text-3xl font-bold ${data.unansweredParentMessages > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {data.unansweredParentMessages}
                </p>
                <p className="text-xs text-muted-foreground">
                  unanswered (&gt;24h)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fee Collection */}
        <Card className={`border ${rateBg(data.feeCollectionRate, 70)}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#E9C46A]/10 p-2.5">
                <CreditCard className="h-5 w-5 text-[#E9C46A]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fee Collection</p>
                <p className={`text-3xl font-bold ${rateColor(data.feeCollectionRate, 70)}`}>
                  {formatRate(data.feeCollectionRate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatNaira(data.totalFeesOutstanding)} outstanding
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Alerts Banner ── */}
      {data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alerts ({data.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.alerts.map((alert: AdminDashboardAlert, i: number) => (
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
                ) : alert.severity === 'warning' ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <Activity className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
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

      {/* ── Row 3: Phase-Specific Metrics ── */}
      <PhaseMetricsRow phase={phase} data={data} />

      {/* ── Row 4: Engagement Bar ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <Activity className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Parent Engagement</p>
            <p className={`text-2xl font-bold ${rateColor(data.parentEngagementRate, 50)}`}>
              {formatRate(data.parentEngagementRate)}
            </p>
            <p className="text-xs text-muted-foreground">active this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <BookOpen className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Homework Assigned</p>
            <p className="text-2xl font-bold">{data.homeworkAssignedThisWeek}</p>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <MessageSquare className="h-4 w-4 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Announcements</p>
            <p className="text-2xl font-bold">{data.announcementsSentToday}</p>
            <p className="text-xs text-muted-foreground">sent today</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 5: Worst 5 Tables ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teachers Needing Follow-up */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Teachers Needing Follow-up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium text-right">Att. Days</th>
                    <th className="pb-2 font-medium text-right">HW</th>
                    <th className="pb-2 font-medium text-right">Unans.</th>
                    <th className="pb-2 font-medium text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.worstTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        All teachers are on track
                      </td>
                    </tr>
                  ) : (
                    data.worstTeachers.map((t) => (
                      <tr key={t.teacherId} className="hover:bg-muted/50">
                        <td className="py-2 font-medium">{t.teacherName}</td>
                        <td className="py-2 text-right">{t.daysAttendanceMarked}</td>
                        <td className="py-2 text-right">{t.homeworkAssigned}</td>
                        <td className="py-2 text-right">
                          <span className={t.unansweredMessages > 0 ? 'text-red-500 font-medium' : ''}>
                            {t.unansweredMessages}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span className={rateColor(t.activityScore, 70)}>
                            {t.activityScore.toFixed(0)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Classes - Lowest Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Classes - Lowest Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Class</th>
                    <th className="pb-2 font-medium text-right">Rate</th>
                    <th className="pb-2 font-medium text-right">Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.worstClassesAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-muted-foreground">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    data.worstClassesAttendance.map((c) => (
                      <tr key={c.classId} className="hover:bg-muted/50">
                        <td className="py-2 font-medium">{c.className}</td>
                        <td className="py-2 text-right">
                          <span className={rateColor(c.attendanceRate, 80)}>
                            {formatRate(c.attendanceRate)}
                          </span>
                        </td>
                        <td className="py-2 text-right">{c.studentCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Students - Lowest Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Students - Lowest Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Class</th>
                    <th className="pb-2 font-medium text-right">Rate</th>
                    <th className="pb-2 font-medium text-right">Absent</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.worstStudentsAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    data.worstStudentsAttendance.map((s) => (
                      <tr key={s.studentId} className="hover:bg-muted/50">
                        <td className="py-2 font-medium">{s.studentName}</td>
                        <td className="py-2 text-muted-foreground">{s.className}</td>
                        <td className="py-2 text-right">
                          <span className={rateColor(s.attendanceRate, 80)}>
                            {formatRate(s.attendanceRate)}
                          </span>
                        </td>
                        <td className="py-2 text-right text-red-500 font-medium">
                          {s.daysAbsent}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Classes - No Homework This Week */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Classes - No Homework This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Class</th>
                    <th className="pb-2 font-medium">Teacher</th>
                    <th className="pb-2 font-medium text-right">Days Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.classesNoHomework.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-muted-foreground">
                        All classes have recent homework
                      </td>
                    </tr>
                  ) : (
                    data.classesNoHomework.map((c) => (
                      <tr key={c.classId} className="hover:bg-muted/50">
                        <td className="py-2 font-medium">{c.className}</td>
                        <td className="py-2 text-muted-foreground">{c.classTeacherName ?? '—'}</td>
                        <td className="py-2 text-right text-amber-500 font-medium">
                          {c.daysSinceLastHomework}d
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Unanswered Parent Messages - full width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Unanswered Parent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Parent</th>
                    <th className="pb-2 font-medium">Message</th>
                    <th className="pb-2 font-medium text-right">Hours Ago</th>
                    <th className="pb-2 font-medium">Teacher</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.unansweredThreads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        No unanswered messages
                      </td>
                    </tr>
                  ) : (
                    data.unansweredThreads.map((t) => (
                      <tr key={t.conversationId} className="hover:bg-muted/50">
                        <td className="py-2 font-medium">{t.parentName}</td>
                        <td className="py-2 text-muted-foreground max-w-[200px] truncate">
                          {t.lastMessage}
                        </td>
                        <td className="py-2 text-right">
                          <span className={t.hoursUnanswered > 24 ? 'text-red-500 font-medium' : 'text-amber-500'}>
                            {t.hoursUnanswered.toFixed(0)}h
                          </span>
                        </td>
                        <td className="py-2 text-muted-foreground">{t.teacherName ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase Metrics Sub-Component
// ---------------------------------------------------------------------------

function PhaseMetricsRow({
  phase,
  data,
}: {
  phase: Phase;
  data: EnhancedAdminDashboard;
}) {
  const pm = data.phaseMetrics;

  if (!pm) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No phase metrics available for {PHASE_LABELS[phase]}.
        </CardContent>
      </Card>
    );
  }

  switch (phase) {
    case 'RESUMPTION':
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <GraduationCap className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">New Students This Term</p>
              <p className="text-2xl font-bold">{pm.newStudentsThisTerm ?? '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <AlertTriangle className="h-4 w-4 text-amber-500 mb-2" />
              <p className="text-sm text-muted-foreground">Incomplete Registrations</p>
              <p className={`text-2xl font-bold ${(pm.incompleteRegistrations ?? 0) > 0 ? 'text-amber-500' : ''}`}>
                {pm.incompleteRegistrations ?? '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <CreditCard className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Unpaid Fees</p>
              <p className={`text-2xl font-bold ${(pm.unpaidFeesCount ?? 0) > 0 ? 'text-red-500' : ''}`}>
                {pm.unpaidFeesCount ?? '—'}
              </p>
            </CardContent>
          </Card>
        </div>
      );

    case 'MID_TERM':
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              {(pm.termAttendanceTrend ?? 0) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-600 mb-2" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mb-2" />
              )}
              <p className="text-sm text-muted-foreground">Attendance Trend</p>
              <p className={`text-2xl font-bold ${(pm.termAttendanceTrend ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {pm.termAttendanceTrend != null ? `${pm.termAttendanceTrend >= 0 ? '+' : ''}${formatRate(pm.termAttendanceTrend)}` : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <BookOpen className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Homework Completion</p>
              <p className={`text-2xl font-bold ${rateColor(pm.homeworkCompletionRate ?? 0, 70)}`}>
                {pm.homeworkCompletionRate != null ? formatRate(pm.homeworkCompletionRate) : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Users className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Parent Weekly Engagement</p>
              <p className={`text-2xl font-bold ${rateColor(pm.parentWeeklyEngagement ?? 0, 50)}`}>
                {pm.parentWeeklyEngagement != null ? formatRate(pm.parentWeeklyEngagement) : '—'}
              </p>
            </CardContent>
          </Card>
        </div>
      );

    case 'EXAM':
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Assessments Created</p>
              <p className="text-2xl font-bold">{pm.assessmentsCreated ?? '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Assessments Graded</p>
              <p className="text-2xl font-bold">{pm.assessmentsGraded ?? '—'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Activity className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Assessment Coverage</p>
              <p className={`text-2xl font-bold ${rateColor(pm.assessmentCoverage ?? 0, 80)}`}>
                {pm.assessmentCoverage != null ? formatRate(pm.assessmentCoverage) : '—'}
              </p>
            </CardContent>
          </Card>
        </div>
      );

    case 'END_OF_TERM':
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <CreditCard className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Term Fee Collection</p>
              <p className={`text-2xl font-bold ${rateColor(pm.termFeeCollectionRate ?? 0, 70)}`}>
                {pm.termFeeCollectionRate != null ? formatRate(pm.termFeeCollectionRate) : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <GraduationCap className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Avg Term Score</p>
              <p className="text-2xl font-bold">
                {pm.avgTermScore != null ? pm.avgTermScore.toFixed(1) : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Clock className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Report Cards Generated</p>
              <p className="text-2xl font-bold">{pm.reportCardsGenerated ?? '—'}</p>
            </CardContent>
          </Card>
        </div>
      );
  }
}
