'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  GraduationCap,
  TrendingUp,
  TrendingDown,
  ClipboardCheck,
  BookOpen,
  MessageSquare,
  CreditCard,
  Calendar,
  Megaphone,
  RefreshCw,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/shared/stat-card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useChildStore } from '@/lib/stores/child-store';
import { useParentDashboard } from '@/lib/hooks/use-dashboard';
import type {
  ParentAcademicOverview,

  ParentSubjectItem,
  ParentAssessmentItem,
  ParentAnnouncementItem,
  ParentEventItem,
  ParentChildSummary,
  UpcomingFee,
  RecentHomeworkItem,
} from '@/lib/types/dashboard';

// ─── Color maps ────────────────────────────────────────────────────

const feeStatusColors: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

const homeworkStatusColors: Record<string, string> = {
  SUBMITTED: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  GRADED: 'bg-blue-100 text-blue-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

const assessmentTypeColors: Record<string, string> = {
  CA1: 'bg-blue-100 text-blue-700',
  CA2: 'bg-indigo-100 text-indigo-700',
  CA3: 'bg-violet-100 text-violet-700',
  EXAM: 'bg-purple-100 text-purple-700',
};

// ─── Helpers ───────────────────────────────────────────────────────



function getAttendanceBgColor(rate: number): string {
  if (rate >= 90) return 'bg-emerald-50';
  if (rate >= 75) return 'bg-amber-50';
  return 'bg-red-50';
}

function formatNaira(amount: number): string {
  if (amount >= 1_000_000) {
    return `\u20A6${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `\u20A6${(amount / 1_000).toFixed(0)}K`;
  }
  return `\u20A6${amount.toLocaleString()}`;
}

function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
  });
}

function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isPresent(status: string | null | undefined): boolean {
  if (!status) return false;
  return status.toLowerCase().includes('present');
}

// ─── Skeleton ──────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Child info + academic snapshot */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[100px] rounded-lg" />
        <Skeleton className="h-[100px] rounded-lg" />
      </div>
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-lg" />
        ))}
      </div>
      {/* Table */}
      <Skeleton className="h-[300px] rounded-lg" />
      {/* Two columns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[250px] rounded-lg" />
        <Skeleton className="h-[250px] rounded-lg" />
      </div>
    </div>
  );
}

// ─── Row 1: Child Info + Academic Snapshot ──────────────────────────

function ChildInfoCard({ child }: { child: ParentChildSummary }) {
  const present = isPresent(child.attendance);
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{child.name}</p>
          <p className="text-sm text-muted-foreground">{child.className}</p>
        </div>
        <Badge
          variant="secondary"
          className={
            present
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }
        >
          {child.attendance || 'N/A'}
        </Badge>
      </CardContent>
    </Card>
  );
}

function AcademicSnapshotCard({
  data,
}: {
  data: ParentAcademicOverview | null;
}) {
  if (!data) {
    return (
      <Card>
        <CardContent className="flex h-full items-center justify-center p-5">
          <p className="text-sm text-muted-foreground">
            Academic data not yet available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasPosition = data.classPosition != null && data.classSize != null;

  return (
    <Card>
      <CardContent className="flex items-center gap-6 p-5">
        {/* Rank */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Rank</p>
          {hasPosition ? (
            <p className="text-2xl font-bold text-primary">
              {formatOrdinal(data.classPosition!)}
              <span className="text-base font-normal text-muted-foreground">
                {' '}
                / {data.classSize}
              </span>
            </p>
          ) : (
            <p className="text-lg text-muted-foreground">--</p>
          )}
        </div>

        <div className="h-10 w-px bg-border" />

        {/* Grade */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Grade</p>
          {data.grade ? (
            <Badge variant="secondary" className="mt-1 text-lg font-bold">
              {data.grade}
            </Badge>
          ) : data.overallAverage != null ? (
            <p className="text-2xl font-bold">{data.overallAverage.toFixed(1)}%</p>
          ) : (
            <p className="text-lg text-muted-foreground">--</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Row 4: Subject Performance Table ──────────────────────────────

function SubjectPerformanceTable({
  subjects,
}: {
  subjects: ParentSubjectItem[];
}) {
  // Sort: worst performing first (below avg and declining first, then by studentAvg ascending)
  const sorted = [...subjects].sort((a, b) => {
    const aRisk = (a.belowClassAvg ? 2 : 0) + (a.declining ? 1 : 0);
    const bRisk = (b.belowClassAvg ? 2 : 0) + (b.declining ? 1 : 0);
    if (aRisk !== bRisk) return bRisk - aRisk;
    return (a.studentAvg ?? 0) - (b.studentAvg ?? 0);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Subject Performance
        </CardTitle>
        <CardDescription>
          Detailed breakdown across all subjects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No subject performance data available yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Subject</th>
                  <th className="pb-3 pr-4 font-medium">Child Avg</th>
                  <th className="pb-3 pr-4 font-medium">Class Avg</th>
                  <th className="pb-3 pr-4 font-medium">Grade</th>
                  <th className="pb-3 pr-4 font-medium">Trend</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((subject) => {
                  const aboveAvg =
                    subject.studentAvg != null &&
                    subject.classAvg != null &&
                    subject.studentAvg >= subject.classAvg;
                  return (
                    <tr
                      key={subject.subjectName}
                      className="border-b last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium">
                        {subject.subjectName}
                      </td>
                      <td
                        className={`py-3 pr-4 font-semibold ${
                          subject.belowClassAvg
                            ? 'text-red-600'
                            : aboveAvg
                              ? 'text-emerald-600'
                              : ''
                        }`}
                      >
                        {subject.studentAvg != null
                          ? `${subject.studentAvg.toFixed(1)}%`
                          : '--'}
                        {subject.belowClassAvg && <span className="sr-only">(Below class average)</span>}
                        {aboveAvg && <span className="sr-only">(Above class average)</span>}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {subject.classAvg != null
                          ? `${subject.classAvg.toFixed(1)}%`
                          : '--'}
                      </td>
                      <td className="py-3 pr-4">
                        {subject.grade ? (
                          <Badge variant="outline">{subject.grade}</Badge>
                        ) : (
                          '--'
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {subject.trend != null ? (
                          <span
                            className={`flex items-center gap-1 ${
                              subject.declining
                                ? 'text-amber-600'
                                : subject.trend >= 0
                                  ? 'text-emerald-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {subject.trend >= 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            <span className="sr-only">{subject.trend >= 0 ? 'Improving' : 'Declining'}</span>
                            {Math.abs(subject.trend).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </td>
                      <td className="py-3">
                        {subject.belowClassAvg ? (
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-700 text-[10px]"
                          >
                            Below avg
                          </Badge>
                        ) : subject.declining ? (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700 text-[10px]"
                          >
                            Declining
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 text-[10px]"
                          >
                            On track
                          </Badge>
                        )}
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
  );
}

// ─── Row 5 Left: Recent Assessments ────────────────────────────────

function RecentAssessmentsCard({
  assessments,
}: {
  assessments: ParentAssessmentItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Recent Assessments
        </CardTitle>
        <CardDescription>Latest scores and grades</CardDescription>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recent assessments available.
          </p>
        ) : (
          <div className="space-y-3">
            {assessments.slice(0, 5).map((a, i) => (
              <div
                key={a.assessmentId ?? `${a.title}-${i}`}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.subjectName}
                    {a.date && <> &middot; {formatDate(a.date)}</>}
                  </p>
                </div>
                <div className="flex items-center gap-2 pl-3">
                  <div className="text-right">
                    <span className="text-sm font-semibold">
                      {a.score != null && a.maxScore != null
                        ? `${a.score}/${a.maxScore}`
                        : '--'}
                    </span>
                    {a.classAverage != null && a.percentage != null && (
                      <p
                        className={`text-xs ${
                          a.percentage >= a.classAverage
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {a.percentage >= a.classAverage ? 'Above' : 'Below'} class {a.classAverage.toFixed(0)}%
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] uppercase ${assessmentTypeColors[a.type?.toUpperCase()] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {a.type}
                  </Badge>
                </div>
              </div>
            ))}
            {assessments.length > 5 && (
              <div className="mt-1 flex justify-end">
                <Link href="/academics/grades" className="text-sm text-primary hover:underline">
                  View all &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Row 5 Right: Recent Homework ──────────────────────────────────

function RecentHomeworkCard({
  homework,
}: {
  homework: RecentHomeworkItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Recent Homework
        </CardTitle>
        <CardDescription>Latest assignments</CardDescription>
      </CardHeader>
      <CardContent>
        {homework.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recent homework at this school.
          </p>
        ) : (
          <div className="space-y-3">
            {homework.slice(0, 5).map((hw, i) => (
              <div
                key={`${hw.childName}-${hw.title}-${i}`}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{hw.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {hw.subject} &middot; Due {formatDateFull(hw.dueDate)}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={`ml-2 shrink-0 text-[10px] uppercase ${homeworkStatusColors[hw.status?.toUpperCase()] ?? ''}`}
                >
                  {hw.status}
                </Badge>
              </div>
            ))}
            {homework.length > 5 && (
              <div className="mt-1 flex justify-end">
                <Link href="/homework" className="text-sm text-primary hover:underline">
                  View all &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Row 6 Left: Announcements ─────────────────────────────────────

function AnnouncementsCard({
  announcements,
}: {
  announcements: ParentAnnouncementItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          Announcements
        </CardTitle>
        <CardDescription>Latest school announcements</CardDescription>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recent announcements.
          </p>
        ) : (
          <div className="space-y-3">
            {announcements.slice(0, 5).map((a) => (
              <div key={a.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{a.title}</p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatDate(a.publishedAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {a.content}
                </p>
              </div>
            ))}
            {announcements.length > 5 && (
              <div className="mt-1 flex justify-end">
                <Link href="/communication/announcements" className="text-sm text-primary hover:underline">
                  View all &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Row 6 Right: Upcoming Events ──────────────────────────────────

function UpcomingEventsCard({
  events,
}: {
  events: ParentEventItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>
        <CardDescription>School events and activities</CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming events.
          </p>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 5).map((e) => (
              <div key={e.id} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{e.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDateFull(e.startDate)}</span>
                  {e.location && (
                    <>
                      <span>&middot;</span>
                      <span>{e.location}</span>
                    </>
                  )}
                </div>
                {e.description && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {e.description}
                  </p>
                )}
              </div>
            ))}
            {events.length > 5 && (
              <div className="mt-1 flex justify-end">
                <Link href="/calendar" className="text-sm text-primary hover:underline">
                  View all &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Row 7: Upcoming Fees ──────────────────────────────────────────

function UpcomingFeesCard({ fees }: { fees: UpcomingFee[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Upcoming Fees
        </CardTitle>
        <CardDescription>Fee payments due</CardDescription>
      </CardHeader>
      <CardContent>
        {fees.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No pending fees -- all clear.
          </p>
        ) : (
          <div className="space-y-3">
            {fees.map((fee, index) => (
              <div
                key={`${fee.childName}-${fee.description}-${index}`}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{fee.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {fee.childName} &middot; Due {formatDateFull(fee.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {'\u20A6'}
                    {fee.amount.toLocaleString()}
                  </p>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] uppercase ${feeStatusColors[fee.status?.toUpperCase()] ?? ''}`}
                  >
                    {fee.status}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="mt-1 flex justify-end">
              <Link href="/fees" className="text-sm text-primary hover:underline">
                View all &rarr;
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Parent Dashboard ─────────────────────────────────────────

export function ParentDashboard() {
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);
  const user = useAuthStore((s) => s.user);
  const selectedChildId = useChildStore((s) => s.selectedChildId);
  const { data: response, isLoading, isError, refetch } = useParentDashboard(selectedChildId || undefined);
  const router = useRouter();

  const currentSchool = user?.roles.find(
    (r) => r.schoolId === currentSchoolId,
  );
  const schoolName = currentSchool?.schoolName ?? 'School';

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !response?.data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
        <p>Unable to load dashboard data.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const data = response.data;
  const {
    children,
    upcomingFees,
    recentHomework,
    academicPerformance,
    attendanceMetrics,
    subjectPerformance,
    recentAssessments,
    recentAnnouncements,
    upcomingEvents,
    unreadMessages,
  } = data;

  // Find the selected child (from child-store) or default to first
  const activeChild =
    children.find((c) => c.studentId === selectedChildId) ?? children[0];

  // Filter child-specific data by active child name
  const activeChildName = activeChild?.name;
  const filteredHomework = activeChildName
    ? recentHomework.filter((hw) => hw.childName === activeChildName)
    : recentHomework;
  const filteredFees = activeChildName
    ? upcomingFees.filter((fee) => fee.childName === activeChildName)
    : upcomingFees;

  // Compute homework stats scoped to active child
  const overdueHomework = filteredHomework.filter(
    (hw) => hw.status?.toUpperCase() === 'OVERDUE',
  ).length;

  return (
    <div className="space-y-6">
      {/* ── Row 1: Child Info + Academic Snapshot ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {activeChild ? (
          <ChildInfoCard child={activeChild} />
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center p-5">
              <p className="text-sm text-muted-foreground">
                No children enrolled at {schoolName}.
              </p>
            </CardContent>
          </Card>
        )}
        <AcademicSnapshotCard data={academicPerformance ?? null} />
      </div>

      {/* ── Row 2: 4 Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Attendance */}
        <StatCard
          title="Attendance"
          onClick={() => router.push('/attendance')}
          value={
            attendanceMetrics
              ? `${attendanceMetrics.attendanceRate.toFixed(0)}%`
              : data.todayAttendance
          }
          description={
            attendanceMetrics ? (
              <span>
                {attendanceMetrics.presentDays}P / {attendanceMetrics.absentDays}
                A / {attendanceMetrics.lateDays}L
              </span>
            ) : (
              'attendance status'
            )
          }
          icon={ClipboardCheck}
          className={
            attendanceMetrics
              ? getAttendanceBgColor(attendanceMetrics.attendanceRate)
              : undefined
          }
        />

        {/* Homework */}
        <StatCard
          title="Homework"
          onClick={() => router.push('/homework')}
          value={filteredHomework.length}
          description={
            overdueHomework > 0 ? (
              <span className="text-red-600">
                {overdueHomework} overdue
              </span>
            ) : (
              'assignments due'
            )
          }
          icon={BookOpen}
        />

        {/* Messages */}
        <StatCard
          title="Messages"
          onClick={() => router.push('/communication/messages')}
          value={unreadMessages ?? 0}
          description="unread"
          icon={MessageSquare}
        />

        {/* Fees */}
        <StatCard
          title="Fees Owing"
          onClick={() => router.push('/fees')}
          value={data.pendingFees > 0 ? formatNaira(data.pendingFees) : '\u20A60'}
          description="balance"
          icon={CreditCard}
        />
      </div>

      {/* ── Deep Dive Section ── */}

      {/* ── Row 4: Subject Performance Table ── */}
      {subjectPerformance && subjectPerformance.length > 0 && (
        <SubjectPerformanceTable subjects={subjectPerformance} />
      )}

      {/* ── Row 5: Recent Assessments + Recent Homework ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentAssessmentsCard assessments={recentAssessments ?? []} />
        <RecentHomeworkCard homework={filteredHomework} />
      </div>

      {/* ── Row 6: Announcements + Upcoming Events ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnnouncementsCard announcements={recentAnnouncements ?? []} />
        <UpcomingEventsCard events={upcomingEvents ?? []} />
      </div>

      {/* ── Row 7: Upcoming Fees ── */}
      <UpcomingFeesCard fees={filteredFees} />
    </div>
  );
}
