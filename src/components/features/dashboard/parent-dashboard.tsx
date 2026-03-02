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
import { StatCard } from '@/components/shared/stat-card';
import { useAuthStore } from '@/lib/stores/auth-store';

// ---------------------------------------------------------------------------
// Mock data — will be replaced with API calls when parent endpoints are built.
// Keyed by school ID so the dashboard visually updates when the parent
// switches between schools via the SchoolSwitcher.  When real APIs are
// available the correct school's data will come from the backend
// automatically (React Query keys include schoolId).
// ---------------------------------------------------------------------------

const FALLBACK_SCHOOL = 'default';

type MockChild = {
  id: string;
  name: string;
  className: string;
  school: string;
  attendance: string;
  recentGrade: string;
};

type MockFee = {
  id: string;
  child: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
};

type MockHomework = {
  id: string;
  child: string;
  subject: string;
  title: string;
  dueDate: string;
  status: 'submitted' | 'pending' | 'graded';
};

type MockSchoolData = {
  stats: {
    myChildren: number;
    todayAttendance: string;
    pendingFees: number;
    pendingHomework: number;
  };
  children: MockChild[];
  upcomingFees: MockFee[];
  recentHomework: MockHomework[];
};

const mockDataBySchool: Record<string, MockSchoolData> = {
  // Kings Academy (schoolId a0000000-0000-0000-0000-000000000001)
  'a0000000-0000-0000-0000-000000000001': {
    stats: {
      myChildren: 1,
      todayAttendance: 'Present',
      pendingFees: 150_000,
      pendingHomework: 2,
    },
    children: [
      {
        id: '1',
        name: 'Tunde Johnson',
        className: 'JSS 1A',
        school: 'Kings Academy Lagos',
        attendance: 'Present',
        recentGrade: 'A (Mathematics CA1)',
      },
    ],
    upcomingFees: [
      {
        id: '1',
        child: 'Tunde Johnson',
        description: 'Second Term Tuition',
        amount: 150_000,
        dueDate: '2026-03-15',
        status: 'overdue',
      },
    ],
    recentHomework: [
      {
        id: '1',
        child: 'Tunde Johnson',
        subject: 'Mathematics',
        title: 'Algebra Practice',
        dueDate: '2026-03-05',
        status: 'submitted',
      },
      {
        id: '2',
        child: 'Tunde Johnson',
        subject: 'English',
        title: 'Essay Writing',
        dueDate: '2026-03-07',
        status: 'pending',
      },
    ],
  },

  // Greenfield International (schoolId a0000000-0000-0000-0000-000000000002)
  'a0000000-0000-0000-0000-000000000002': {
    stats: {
      myChildren: 1,
      todayAttendance: 'Present',
      pendingFees: 100_000,
      pendingHomework: 1,
    },
    children: [
      {
        id: '2',
        name: 'Aisha Johnson',
        className: 'Primary 5B',
        school: 'Greenfield International School',
        attendance: 'Present',
        recentGrade: 'B+ (English CA1)',
      },
    ],
    upcomingFees: [
      {
        id: '2',
        child: 'Aisha Johnson',
        description: 'Second Term Tuition',
        amount: 100_000,
        dueDate: '2026-03-20',
        status: 'pending',
      },
    ],
    recentHomework: [
      {
        id: '3',
        child: 'Aisha Johnson',
        subject: 'Science',
        title: 'Weather Report',
        dueDate: '2026-03-06',
        status: 'pending',
      },
    ],
  },

  // Fallback for any other school
  [FALLBACK_SCHOOL]: {
    stats: {
      myChildren: 2,
      todayAttendance: 'All Present',
      pendingFees: 250_000,
      pendingHomework: 3,
    },
    children: [
      {
        id: '1',
        name: 'Tunde Johnson',
        className: 'JSS 1A',
        school: 'Kings Academy Lagos',
        attendance: 'Present',
        recentGrade: 'A (Mathematics CA1)',
      },
      {
        id: '2',
        name: 'Aisha Johnson',
        className: 'Primary 5B',
        school: 'Greenfield International School',
        attendance: 'Present',
        recentGrade: 'B+ (English CA1)',
      },
    ],
    upcomingFees: [
      {
        id: '1',
        child: 'Tunde Johnson',
        description: 'Second Term Tuition',
        amount: 150_000,
        dueDate: '2026-03-15',
        status: 'overdue',
      },
      {
        id: '2',
        child: 'Aisha Johnson',
        description: 'Second Term Tuition',
        amount: 100_000,
        dueDate: '2026-03-20',
        status: 'pending',
      },
    ],
    recentHomework: [
      {
        id: '1',
        child: 'Tunde Johnson',
        subject: 'Mathematics',
        title: 'Algebra Practice',
        dueDate: '2026-03-05',
        status: 'submitted',
      },
      {
        id: '2',
        child: 'Tunde Johnson',
        subject: 'English',
        title: 'Essay Writing',
        dueDate: '2026-03-07',
        status: 'pending',
      },
      {
        id: '3',
        child: 'Aisha Johnson',
        subject: 'Science',
        title: 'Weather Report',
        dueDate: '2026-03-06',
        status: 'pending',
      },
    ],
  },
};

const feeStatusColors: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
};

const homeworkStatusColors: Record<string, string> = {
  submitted: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  graded: 'bg-blue-100 text-blue-700',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ParentDashboard() {
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);
  const user = useAuthStore((s) => s.user);

  // Resolve current school name from the user's roles
  const currentSchool = user?.roles.find(
    (r) => r.schoolId === currentSchoolId,
  );
  const schoolName = currentSchool?.schoolName ?? 'School';

  // Pick mock data for the currently selected school (falls back to default)
  const data =
    mockDataBySchool[currentSchoolId ?? FALLBACK_SCHOOL] ??
    mockDataBySchool[FALLBACK_SCHOOL];

  const { stats, children, upcomingFees, recentHomework } = data;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Children"
          value={stats.myChildren}
          description={`at ${schoolName}`}
          icon={GraduationCap}
        />
        <StatCard
          title="Today's Attendance"
          value={stats.todayAttendance}
          description="all children present"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Pending Fees"
          value={`\u20A6${(stats.pendingFees / 1_000).toFixed(0)}K`}
          description="awaiting payment"
          icon={DollarSign}
        />
        <StatCard
          title="Pending Homework"
          value={stats.pendingHomework}
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
                  key={child.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2A9D8F]/10">
                      <GraduationCap className="h-5 w-5 text-[#2A9D8F]" />
                    </div>
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {child.className} &middot; {child.school}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge
                      variant="secondary"
                      className={
                        child.attendance === 'Present'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }
                    >
                      {child.attendance}
                    </Badge>
                    <span className="text-muted-foreground">
                      {child.recentGrade}
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
                {upcomingFees.map((fee) => (
                  <div
                    key={fee.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{fee.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {fee.child} &middot; Due{' '}
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
                        className={`text-[10px] uppercase ${feeStatusColors[fee.status] ?? ''}`}
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
            <CardDescription>Latest assignments for your children</CardDescription>
          </CardHeader>
          <CardContent>
            {recentHomework.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent homework at this school.
              </p>
            ) : (
              <div className="space-y-3">
                {recentHomework.map((hw) => (
                  <div
                    key={hw.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{hw.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {hw.child} &middot; {hw.subject} &middot; Due{' '}
                        {new Date(hw.dueDate).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] uppercase ${homeworkStatusColors[hw.status] ?? ''}`}
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
