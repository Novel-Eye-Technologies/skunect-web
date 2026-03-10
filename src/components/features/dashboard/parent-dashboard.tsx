'use client';

import {
  GraduationCap,
  ClipboardCheck,
  DollarSign,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Calendar,
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
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/shared/stat-card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useParentDashboard } from '@/lib/hooks/use-dashboard';
import type {
  AcademicPerformance,
  AttendanceMetrics,
  RecentAssessment,
  SubjectPerformance,
} from '@/lib/types/dashboard';

const feeStatusColors: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  OVERDUE: 'bg-red-100 text-red-700',
};

const homeworkStatusColors: Record<string, string> = {
  SUBMITTED: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  GRADED: 'bg-blue-100 text-blue-700',
};

const assessmentTypeColors: Record<string, string> = {
  CA1: 'bg-blue-100 text-blue-700',
  CA2: 'bg-indigo-100 text-indigo-700',
  CA3: 'bg-violet-100 text-violet-700',
  EXAM: 'bg-purple-100 text-purple-700',
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[200px] rounded-lg" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[200px] rounded-lg" />
        <Skeleton className="h-[200px] rounded-lg" />
      </div>
    </div>
  );
}

function getAttendanceRateColor(rate: number): string {
  if (rate >= 90) return 'text-emerald-600';
  if (rate >= 75) return 'text-amber-600';
  return 'text-red-600';
}

function getGradeLetter(score: number): string {
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// ─── Academic Performance Section ──────────────────────────────────

function AcademicPerformanceCard({
  data,
}: {
  data: AcademicPerformance;
}) {
  return (
    <Card data-testid="academic-performance-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Academic Performance
        </CardTitle>
        <CardDescription>Current term academic summary</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground">Overall Average</p>
            <p className="text-3xl font-bold text-primary" data-testid="overall-average">
              {data.overallAverage.toFixed(1)}%
            </p>
            <Badge variant="secondary" className="mt-1">
              Grade {getGradeLetter(data.overallAverage)}
            </Badge>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground">Class Position</p>
            <p className="text-3xl font-bold" data-testid="class-position">
              {data.classPosition}
              <span className="text-base font-normal text-muted-foreground">
                /{data.totalStudents}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">students</p>
          </div>
          <div className="rounded-lg border p-4 text-center sm:col-span-2 lg:col-span-1">
            <p className="text-sm text-muted-foreground">Subjects</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <div>
                <p className="text-2xl font-bold" data-testid="core-subjects">
                  {data.coreSubjects}
                </p>
                <p className="text-xs text-muted-foreground">Core</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-2xl font-bold" data-testid="elective-subjects">
                  {data.electiveSubjects}
                </p>
                <p className="text-xs text-muted-foreground">Elective</p>
              </div>
            </div>
            {data.pendingAssignments > 0 && (
              <Badge variant="secondary" className="mt-2 bg-amber-100 text-amber-700">
                {data.pendingAssignments} pending assignment{data.pendingAssignments > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Subject Performance Section ───────────────────────────────────

function SubjectPerformanceCard({
  subjects,
}: {
  subjects: SubjectPerformance[];
}) {
  return (
    <Card data-testid="subject-performance-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Subject Performance Overview
        </CardTitle>
        <CardDescription>
          Current term progress across all subjects
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No subject performance data available yet.
          </p>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject) => {
              const percentage =
                subject.maxPossible > 0
                  ? (subject.currentScore / subject.maxPossible) * 100
                  : 0;
              return (
                <div key={subject.subjectName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{subject.subjectName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {subject.currentScore}/{subject.maxPossible}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {subject.grade}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {subject.assessmentCount} assessment{subject.assessmentCount !== 1 ? 's' : ''} completed
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Recent Assessments Section ────────────────────────────────────

function RecentAssessmentsCard({
  assessments,
}: {
  assessments: RecentAssessment[];
}) {
  return (
    <Card data-testid="recent-assessments-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Recent Assessments
        </CardTitle>
        <CardDescription>Latest assessment scores</CardDescription>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recent assessments available.
          </p>
        ) : (
          <div className="space-y-3">
            {assessments.map((assessment, index) => (
              <div
                key={`${assessment.childName}-${assessment.title}-${index}`}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{assessment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {assessment.childName} &middot; {assessment.subjectName}
                    {assessment.date && (
                      <>
                        {' '}&middot;{' '}
                        {new Date(assessment.date).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" data-testid="assessment-score">
                    {assessment.score}/{assessment.maxScore}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] uppercase ${assessmentTypeColors[assessment.type] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {assessment.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Attendance Metrics Section ────────────────────────────────────

function AttendanceMetricsCard({
  data,
}: {
  data: AttendanceMetrics;
}) {
  return (
    <Card data-testid="attendance-metrics-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Attendance Metrics
        </CardTitle>
        <CardDescription>Current term attendance summary</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Present Days */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-emerald-600" />
              <p className="text-sm text-muted-foreground">Present Days</p>
            </div>
            <p className="mt-1 text-2xl font-bold" data-testid="present-days">
              {data.presentDays}
              <span className="text-base font-normal text-muted-foreground">
                /{data.schoolDays}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">school days</p>
          </div>

          {/* Late Days */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-muted-foreground">Late Days</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-600" data-testid="late-days">
              {data.lateDays}
            </p>
            <p className="text-xs text-muted-foreground">times arrived late</p>
          </div>

          {/* Absent Days */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-red-600" />
              <p className="text-sm text-muted-foreground">Absent Days</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-red-600" data-testid="absent-days">
              {data.absentDays}
            </p>
            <p className="text-xs text-muted-foreground">days missed</p>
          </div>

          {/* Attendance Rate */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
            </div>
            <p
              className={`mt-1 text-2xl font-bold ${getAttendanceRateColor(data.attendanceRate)}`}
              data-testid="attendance-rate"
            >
              {data.attendanceRate.toFixed(1)}%
            </p>
            <Progress
              value={data.attendanceRate}
              className="mt-2 h-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Parent Dashboard ─────────────────────────────────────────

export function ParentDashboard() {
  const user = useAuthStore((s) => s.user);
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);
  const { data: response, isLoading } = useParentDashboard();

  const currentSchool = user?.roles.find(
    (r) => r.schoolId === currentSchoolId,
  );
  const schoolName = currentSchool?.schoolName ?? 'School';

  if (isLoading) return <DashboardSkeleton />;

  const data = response?.data;

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Unable to load dashboard data. Please try again.
      </div>
    );
  }

  const {
    children,
    upcomingFees,
    recentHomework,
    academicPerformance,
    attendanceMetrics,
    recentAssessments,
    subjectPerformance,
  } = data;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Children"
          value={data.childrenCount}
          description={`at ${schoolName}`}
          icon={GraduationCap}
        />
        <StatCard
          title="Today's Attendance"
          value={data.todayAttendance}
          description="attendance status"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Pending Fees"
          value={
            data.pendingFees > 0
              ? `\u20A6${(data.pendingFees / 1_000).toFixed(0)}K`
              : '\u20A60'
          }
          description="awaiting payment"
          icon={DollarSign}
        />
        <StatCard
          title="Pending Homework"
          value={data.pendingHomework}
          description="assignments due"
          icon={BookOpen}
        />
      </div>

      {/* Children Overview */}
      <Card>
        <CardHeader>
          <CardTitle>My Children</CardTitle>
          <CardDescription>
            Children enrolled at {schoolName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No children enrolled at this school.
            </p>
          ) : (
            <div className="space-y-3">
              {children.map((child) => (
                <div
                  key={child.studentId}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {child.className}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge
                      variant="secondary"
                      className={
                        child.attendance?.toLowerCase().includes('present')
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }
                    >
                      {child.attendance || 'N/A'}
                    </Badge>
                    <span className="text-muted-foreground">
                      {child.recentGrade || 'No grades'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Performance */}
      {academicPerformance && (
        <AcademicPerformanceCard data={academicPerformance} />
      )}

      {/* Subject Performance Overview */}
      {subjectPerformance && subjectPerformance.length > 0 && (
        <SubjectPerformanceCard subjects={subjectPerformance} />
      )}

      {/* Two-column: Recent Assessments & Attendance Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Assessments */}
        {recentAssessments && (
          <RecentAssessmentsCard assessments={recentAssessments} />
        )}

        {/* Attendance Metrics */}
        {attendanceMetrics && (
          <AttendanceMetricsCard data={attendanceMetrics} />
        )}
      </div>

      {/* Two-column layout: Fees & Homework */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Fees</CardTitle>
            <CardDescription>Fee payments due soon</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingFees.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending fees at this school.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingFees.map((fee, index) => (
                  <div
                    key={`${fee.childName}-${fee.description}-${index}`}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{fee.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {fee.childName} &middot; Due{' '}
                        {new Date(fee.dueDate).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Homework */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Homework</CardTitle>
            <CardDescription>
              Latest assignments for your children
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentHomework.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent homework at this school.
              </p>
            ) : (
              <div className="space-y-3">
                {recentHomework.map((hw, index) => (
                  <div
                    key={`${hw.childName}-${hw.title}-${index}`}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{hw.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {hw.childName} &middot; {hw.subject} &middot; Due{' '}
                        {new Date(hw.dueDate).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] uppercase ${homeworkStatusColors[hw.status?.toUpperCase()] ?? ''}`}
                    >
                      {hw.status}
                    </Badge>
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
