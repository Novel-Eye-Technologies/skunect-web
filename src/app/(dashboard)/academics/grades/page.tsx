'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { Eye, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { useChildStore } from '@/lib/stores/child-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { QueryErrorBanner } from '@/components/shared/query-error-banner';
import { useStudentSubjectGrades, type StudentSubjectPerformance } from '@/lib/hooks/use-student-grades';
import { GradeBadge } from './grade-badge';

export default function GradesPage() {
  const router = useRouter();
  const currentRole = useAuthStore((s) => s.currentRole);
  const isParent = currentRole === 'PARENT';
  const { children, selectedChildId } = useChildStore();
  
  const selectedChild = children.find((c) => c.id === selectedChildId);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: response = [], isLoading, isError, refetch } = useStudentSubjectGrades(
    selectedChild?.id,
    selectedChild?.classId
  );

  const subjectsList = response;

  const columns = useMemo<ColumnDef<StudentSubjectPerformance>[]>(() => [
    {
      id: 'serialName',
      header: 'S/N',
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: 'subjectName',
      header: 'Subject',
      cell: ({ row }) => (
        <button
          className="font-medium text-primary hover:underline text-left"
          onClick={() => router.push(`/academics/grades/details?subjectId=${row.original.subjectId}`)}
        >
          {row.original.subjectName}
        </button>
      ),
    },
    {
      id: 'caScore',
      header: 'CA Score',
      cell: ({ row }) => row.original.caScore !== null 
        ? `${row.original.caScore} / ${row.original.caMaxScore || '-'}`
        : '—',
    },
    {
      id: 'examScore',
      header: 'Exam Score',
      cell: ({ row }) => row.original.examScore !== null
        ? `${row.original.examScore} / ${row.original.examMaxScore || '-'}`
        : '—',
    },
    {
      id: 'totalScore',
      header: 'Total Score',
      cell: ({ row }) => row.original.totalScore !== null
        ? `${row.original.totalScore} / ${row.original.totalMaxScore || '-'}`
        : '—',
    },
    {
      id: 'gradeLabel',
      header: 'Grade',
      cell: ({ row }) => <GradeBadge grade={row.original.gradeLabel} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/academics/grades/details?subjectId=${row.original.subjectId}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </Button>
      ),
    },
  ], [router, selectedChild]);

  if (!isParent) {
    return (
      <div className="space-y-6">
        <PageHeader title="Grades" description="Student grades overview" />
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-semibold">Not Available</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This module is currently optimized for parent view.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Children's Grades"
        description="View your children's performance across different subjects."
      />

      <div className="space-y-6">
        {!selectedChild ? (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No child selected</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Please select a child from the switcher in the navbar to view their subjects.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {selectedChild.firstName} {selectedChild.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Class: {selectedChild.className || 'Unknown'}
                </p>
              </div>
            </div>

            {isError ? (
              <QueryErrorBanner onRetry={refetch} />
            ) : subjectsList.length === 0 && !isLoading ? (
              <Card className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No subjects found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This child is not enrolled in any subjects yet.
                </p>
              </Card>
            ) : (
              <DataTable
                columns={columns}
                data={subjectsList}
                isLoading={isLoading}
                pageCount={1}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                onPaginationChange={setPagination}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
