'use client';

import { useMemo } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  Users,
  GraduationCap,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { useTeacher, useTeacherSubjects } from '@/lib/hooks/use-teachers';
import { useClasses } from '@/lib/hooks/use-school-settings';
import { useAssessments } from '@/lib/hooks/use-academics';
import { formatDate } from '@/lib/utils/format-date';
import type { SchoolClass, ClassSubject } from '@/lib/types/school';

export function TeacherDetailClient() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawParam = params.teacherId as string;
  const teacherId =
    !rawParam || rawParam === '_'
      ? pathname.split('/').filter(Boolean)[1] ?? rawParam
      : rawParam;

  const { data: teacherResponse, isLoading } = useTeacher(teacherId);
  const teacher = teacherResponse?.data;

  // Get all subject assignments for this teacher (across ALL classes)
  const { data: teacherSubjects } = useTeacherSubjects(teacherId);
  const subjectsList = teacherSubjects ?? [];

  // Get all classes to resolve class names and metadata
  const { data: allClasses } = useClasses();
  const classList = allClasses ?? [];
  const classMap = useMemo(
    () => new Map(classList.map((c: SchoolClass) => [c.id, c])),
    [classList],
  );

  // Group subjects by classId
  const subjectsByClass = useMemo(() => {
    const map = new Map<string, ClassSubject[]>();
    for (const sub of subjectsList) {
      const classId = sub.classId;
      if (!map.has(classId)) map.set(classId, []);
      map.get(classId)!.push(sub);
    }
    return map;
  }, [subjectsList]);

  // Unique classes this teacher is involved with
  const teacherClassIds = useMemo(() => {
    const ids = new Set<string>();
    // Classes where teacher teaches subjects
    for (const sub of subjectsList) ids.add(sub.classId);
    // Classes where teacher is class teacher (may have no subject assignments yet)
    for (const cls of classList) {
      if ((cls as SchoolClass).classTeacherId === teacherId) ids.add(cls.id);
    }
    return Array.from(ids);
  }, [subjectsList, classList, teacherId]);

  // Get assessments
  const { data: assessmentsResponse } = useAssessments({ size: 10 });
  const allAssessments = assessmentsResponse?.data ?? [];

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

  if (!teacher) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/teachers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teachers
        </Button>
        <p className="text-muted-foreground">Teacher not found.</p>
      </div>
    );
  }

  const initials = `${teacher.firstName.charAt(0)}${teacher.lastName.charAt(0)}`;
  const totalStudents = teacherClassIds.reduce((sum, id) => {
    const cls = classMap.get(id);
    return sum + ((cls as SchoolClass)?.studentCount ?? 0);
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${teacher.firstName} ${teacher.lastName}`}
        description={teacher.email}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/teachers')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {teacher.firstName} {teacher.lastName}
                </h2>
                <StatusBadge status={teacher.status} className="mt-1" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{teacher.email}</span>
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                <div className="text-muted-foreground">
                  <span className="font-medium">Joined:</span>{' '}
                  {formatDate(teacher.createdAt)}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium">Last Login:</span>{' '}
                  {teacher.lastLogin ? formatDate(teacher.lastLogin) : 'Never'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-blue-500/10 p-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teacherClassIds.length}</p>
                <p className="text-sm text-muted-foreground">Classes</p>
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
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-purple-500/10 p-2">
                <ClipboardCheck className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subjectsList.length}</p>
                <p className="text-sm text-muted-foreground">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">
            Classes & Subjects ({teacherClassIds.length})
          </TabsTrigger>
          <TabsTrigger value="assessments">
            Assessments ({allAssessments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          {teacherClassIds.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No classes or subjects assigned to this teacher.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {teacherClassIds.map((classId) => {
                const cls = classMap.get(classId) as SchoolClass | undefined;
                const subjects = subjectsByClass.get(classId) ?? [];
                const isClassTeacher = cls?.classTeacherId === teacherId;

                return (
                  <Card key={classId}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            {cls?.name ?? classId}
                          </CardTitle>
                          {cls?.gradeLevel && (
                            <Badge variant="outline">{cls.gradeLevel}</Badge>
                          )}
                          {isClassTeacher && (
                            <Badge variant="secondary" className="text-xs">Class Teacher</Badge>
                          )}
                        </div>
                        {cls && (
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              <GraduationCap className="inline h-4 w-4 mr-1" />
                              {cls.studentCount ?? 0} students
                            </span>
                            <span>Capacity: {cls.capacity}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Subjects ({subjects.length})
                      </p>
                      {subjects.length === 0 ? (
                        <p className="text-sm text-muted-foreground pl-4">
                          Class teacher with no specific subject assignments
                        </p>
                      ) : (
                        <div className="pl-4 space-y-1">
                          {subjects.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between text-sm py-1"
                            >
                              <div className="flex items-center gap-2">
                                <span>{s.subjectName}</span>
                                {s.subjectCode && (
                                  <Badge variant="outline" className="text-xs">
                                    {s.subjectCode}
                                  </Badge>
                                )}
                              </div>
                              {s.isClassTeacher && (
                                <span className="text-muted-foreground text-xs">
                                  via Class Teacher role
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assessments">
          {allAssessments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No assessments found.
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
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Class</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Subject</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Type</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Max Score</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allAssessments.map((a: Record<string, unknown>) => (
                        <tr key={a.id as string} className="border-b last:border-0">
                          <td className="py-2 pr-4">{a.title as string}</td>
                          <td className="py-2 pr-4 text-muted-foreground">{a.className as string}</td>
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
