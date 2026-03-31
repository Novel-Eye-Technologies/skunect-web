'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { useClasses, useClassSubjects } from '@/lib/hooks/use-school-settings';
import { useStudents } from '@/lib/hooks/use-students';
import { useAssessments } from '@/lib/hooks/use-academics';
import { formatDate } from '@/lib/utils/format-date';
import type { SchoolClass, ClassSubject } from '@/lib/types/school';

export function ClassDetailClient() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawParam = params.classId as string;
  const classId =
    !rawParam || rawParam === '_'
      ? pathname.split('/').filter(Boolean)[2] ?? rawParam
      : rawParam;

  // useClasses uses select, so data is the unwrapped array
  const { data: allClasses, isLoading: classesLoading } = useClasses();
  const schoolClass = (allClasses ?? []).find((c: SchoolClass) => c.id === classId);

  // useStudents returns full ApiResponse (no select)
  const { data: studentsResponse, isLoading: studentsLoading } = useStudents({
    classId,
    size: 200,
  });
  const students = studentsResponse?.data ?? [];

  // useClassSubjects uses select, so data is the unwrapped array
  const { data: subjects, isLoading: subjectsLoading } = useClassSubjects(classId);
  const subjectsList = subjects ?? [];

  // useAssessments returns full ApiResponse (no select)
  const { data: assessmentsResponse } = useAssessments({ classId, size: 50 });
  const assessments = assessmentsResponse?.data ?? [];

  const isLoading = classesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!schoolClass) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/academics/classes')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Classes
        </Button>
        <p className="text-muted-foreground">Class not found.</p>
      </div>
    );
  }

  const studentCount = schoolClass.studentCount ?? 0;
  const capacityPercent = schoolClass.capacity
    ? Math.round((studentCount / schoolClass.capacity) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={schoolClass.name}
        description={schoolClass.gradeLevel ? `Grade Level: ${schoolClass.gradeLevel}` : undefined}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/academics/classes')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-blue-500/10 p-2">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{studentCount}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-green-500/10 p-2">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{capacityPercent}%</p>
                <p className="text-sm text-muted-foreground">
                  Capacity ({studentCount}/{schoolClass.capacity})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-purple-500/10 p-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subjectsList.length}</p>
                <p className="text-sm text-muted-foreground">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-orange-500/10 p-2">
                <ClipboardCheck className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assessments.length}</p>
                <p className="text-sm text-muted-foreground">Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Teacher */}
      {schoolClass.classTeacherName && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Class Teacher:</span>
              <span>{schoolClass.classTeacherName}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="students">
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="subjects">
            Subjects ({subjectsList.length})
          </TabsTrigger>
          <TabsTrigger value="assessments">
            Assessments ({assessments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          {studentsLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : students.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No students enrolled in this class.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Admission No</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Gender</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s: Record<string, unknown>) => (
                        <tr key={s.id as string} className="border-b last:border-0">
                          <td className="py-2 pr-4">
                            <button
                              type="button"
                              className="font-medium text-left hover:underline text-primary"
                              onClick={() => router.push(`/students/${s.id}`)}
                            >
                              {s.firstName as string} {s.lastName as string}
                            </button>
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {(s.admissionNumber as string) ?? '\u2014'}
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground capitalize">
                            {((s.gender as string) ?? '\u2014').toLowerCase()}
                          </td>
                          <td className="py-2">
                            <StatusBadge status={s.status as string} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subjects">
          {subjectsLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : subjectsList.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No subjects assigned to this class.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Subject</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Code</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Teacher</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectsList.map((sub: ClassSubject) => (
                        <tr key={sub.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium">{sub.subjectName}</td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {sub.subjectCode ? (
                              <Badge variant="outline" className="text-xs">{sub.subjectCode}</Badge>
                            ) : '\u2014'}
                          </td>
                          <td className="py-2 text-muted-foreground">
                            {sub.teacherName ?? (sub.isClassTeacher ? 'Class Teacher' : '\u2014')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assessments">
          {assessments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No assessments found for this class.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Title</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Subject</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Max Score</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.map((a: Record<string, unknown>) => (
                        <tr key={a.id as string} className="border-b last:border-0">
                          <td className="py-2 pr-4">{a.title as string}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{a.subjectName as string}</td>
                          <td className="py-2 pr-4">
                            <Badge variant="outline">{a.type as string}</Badge>
                          </td>
                          <td className="py-2 pr-4">{a.maxScore as number}</td>
                          <td className="py-2 text-muted-foreground">{formatDate(a.createdAt as string)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
