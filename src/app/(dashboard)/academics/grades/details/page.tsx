'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, GraduationCap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { useChildStore } from '@/lib/stores/child-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { QueryErrorBanner } from '@/components/shared/query-error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentSubjectGrades } from '@/lib/hooks/use-student-grades';
import { GradeBadge } from '../grade-badge';

export default function GradeDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subjectId = searchParams.get('subjectId');

  const currentRole = useAuthStore((s) => s.currentRole);
  const isParent = currentRole === 'PARENT';
  const { children, selectedChildId } = useChildStore();
  
  const selectedChild = children.find((c) => c.id === selectedChildId);

  const { data: response = [], isLoading, isError, refetch } = useStudentSubjectGrades(
    selectedChild?.id,
    selectedChild?.classId ?? undefined
  );

  const subjectDetails = subjectId ? response.find((s) => s.subjectId === subjectId) : undefined;

  if (!isParent) {
    return (
      <div className="space-y-6">
        <PageHeader title="Grade Details" />
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-semibold">Not Available</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This module is currently optimized for parent view.
          </p>
        </Card>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <Card className="mt-6 flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No child selected</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Please select a child from the switcher in the navbar.
        </p>
      </Card>
    );
  }

  if (isError) return <QueryErrorBanner onRetry={refetch} />;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-2">
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (!subjectId || !subjectDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader title="Subject Not Found" />
        </div>
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-semibold">Subject not found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The subject details you are looking for do not exist or your child is not enrolled.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Go back</span>
        </Button>
        <PageHeader
          title={subjectDetails.subjectName}
          description={`Performance details for ${selectedChild.firstName} - ${selectedChild.className}`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Score</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subjectDetails.totalScore !== null ? subjectDetails.totalScore : '-'} / {subjectDetails.totalMaxScore || '-'}
            </div>
            {subjectDetails.totalScore === null && (
              <p className="text-xs text-muted-foreground mt-1">Pending scores</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CA Score</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subjectDetails.caScore !== null ? subjectDetails.caScore : '-'} / {subjectDetails.caMaxScore > 0 ? subjectDetails.caMaxScore : "-"}
            </div>
            {subjectDetails.caScore === null && (
              <p className="text-xs text-muted-foreground mt-1">Pending scores</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Exam Score</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subjectDetails.examScore !== null ? subjectDetails.examScore : '-'} / {subjectDetails.examMaxScore > 0 ? subjectDetails.examMaxScore : "-"}
            </div>
            {subjectDetails.examScore === null && (
              <p className="text-xs text-muted-foreground mt-1">Pending scores</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Final Grade</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <GradeBadge grade={subjectDetails.gradeLabel} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessments Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {subjectDetails.assessments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No assessments found.
            </div>
          ) : (
            <div className="space-y-4">
              {subjectDetails.assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{assessment.title}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-secondary-foreground/10">
                        {assessment.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Max Score: {assessment.maxScore}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {assessment.score !== null ? (
                        `${assessment.score} / ${assessment.maxScore}`
                      ) : (
                        <span className="text-muted-foreground font-normal text-sm">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
