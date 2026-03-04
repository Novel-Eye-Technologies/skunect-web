'use client';

import {
  GraduationCap,
  ClipboardCheck,
  DollarSign,
  BookOpen,
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
import { StatCard } from '@/components/shared/stat-card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useParentDashboard } from '@/lib/hooks/use-dashboard';

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

  const { children, upcomingFees, recentHomework } = data;

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
