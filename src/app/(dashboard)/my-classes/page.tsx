'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Users,
  ArrowRight,
  ClipboardCheck,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getClasses } from '@/lib/api/school-settings';
import { useTeacherDashboard } from '@/lib/hooks/use-dashboard';
import { useSchoolSettings, useMySubjects } from '@/lib/hooks/use-school-settings';

export default function MyClassesPage() {
  const router = useRouter();
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  const { data: response, isLoading } = useQuery({
    queryKey: ['classes', schoolId ?? ''],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
  });

  const { data: dashboardResponse } = useTeacherDashboard();
  const dashboardData = dashboardResponse?.data;

  const { data: settings } = useSchoolSettings();

  const { data: mySubjects } = useMySubjects();

  const classes = response?.data ?? [];
  const totalStudents = classes.reduce(
    (sum, cls) => sum + (cls.studentCount ?? 0),
    0,
  );

  // Build a map of class attendance from dashboard data
  const attendanceByClass: Record<string, { percentage: number; present: number; total: number }> = {};
  if (dashboardData?.classAttendance) {
    for (const ca of dashboardData.classAttendance) {
      attendanceByClass[ca.className] = {
        percentage: ca.percentage,
        present: ca.present,
        total: ca.total,
      };
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Classes"
        description="View and manage your assigned classes."
      />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[100px] rounded-lg" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[200px] rounded-lg" />
            ))}
          </div>
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No classes assigned</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven&apos;t been assigned to any classes yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Classes"
              value={classes.length}
              description="assigned this term"
              icon={BookOpen}
            />
            <StatCard
              title="Total Students"
              value={totalStudents}
              description="across all classes"
              icon={Users}
            />
            <StatCard
              title="Overall Attendance"
              value={`${dashboardData?.todayAttendanceRate ?? 0}%`}
              description="today's rate"
              icon={ClipboardCheck}
            />
            <StatCard
              title="Current Term"
              value={settings?.currentTermId ? 'Active' : 'N/A'}
              description={
                settings?.currentSessionId
                  ? 'session in progress'
                  : 'no active session'
              }
              icon={Calendar}
            />
          </div>

          {/* Class Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => {
              const attendance = attendanceByClass[cls.name];
              return (
                <Card
                  key={cls.id}
                  className="group transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      {cls.gradeLevel && (
                        <Badge variant="outline" className="text-xs">
                          Section {cls.gradeLevel}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Class Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {cls.studentCount ?? 0}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Students
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {attendance
                              ? `${attendance.percentage}%`
                              : '--'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Attendance
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Attendance Progress */}
                    {attendance && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Today&apos;s Attendance</span>
                          <span>
                            {attendance.present}/{attendance.total}
                          </span>
                        </div>
                        <Progress
                          value={attendance.percentage}
                          className="h-1.5"
                        />
                      </div>
                    )}

                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        router.push(`/students?classId=${cls.id}`)
                      }
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* My Subjects Section */}
          {mySubjects && mySubjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mySubjects.map((cs) => {
                      const cls = classes.find((c) => c.id === cs.classId);
                      return (
                        <TableRow key={cs.id}>
                          <TableCell className="font-medium">
                            {cs.subjectName}
                          </TableCell>
                          <TableCell>{cs.subjectCode ?? '—'}</TableCell>
                          <TableCell>{cls?.name ?? '—'}</TableCell>
                          <TableCell>
                            {cs.isClassTeacher ? (
                              <Badge variant="secondary" className="text-xs">
                                Class Teacher
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Subject Teacher
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
