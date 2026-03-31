'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { BookOpen, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { QueryErrorBanner } from '@/components/shared/query-error-banner';
import { useChildStore } from '@/lib/stores/child-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getClassSubjects } from '@/lib/api/school-settings';
import type { ApiResponse } from '@/lib/api/types';
import type { ClassSubject } from '@/lib/types/school';

export default function SubjectsPage() {
  const currentRole = useAuthStore((s) => s.currentRole);
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const isParent = currentRole === 'PARENT';

  const { children, selectedChildId } = useChildStore();
  const selectedChild = children.find((c) => c.id === selectedChildId);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['class-subjects', schoolId, selectedChild?.classId],
    queryFn: () => getClassSubjects(schoolId!, selectedChild!.classId!),
    enabled: !!schoolId && !!selectedChild?.classId,
    select: (res: ApiResponse<ClassSubject[]>) => res.data ?? [],
  });

  const subjects: ClassSubject[] = response ?? [];

  const columns = useMemo<ColumnDef<ClassSubject>[]>(
    () => [
      {
        id: 'serialNumber',
        header: 'S/N',
        cell: ({ row }) => row.index + 1,
        size: 50,
      },
      {
        accessorKey: 'subjectName',
        header: 'Subject',
        cell: ({ row }) => (
          <div className="font-medium text-primary">
            {row.original.subjectName}
          </div>
        ),
      },
      {
        accessorKey: 'teacherName',
        header: 'Assigned Teacher',
        cell: ({ row }) =>
          row.original.teacherName ? (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{row.original.teacherName}</span>
            </div>
          ) : (
            <span className="text-muted-foreground italic">Not Assigned</span>
          ),
      },
    ],
    [],
  );

  // Guard: non-parents shouldn't land here
  if (!isParent) {
    return (
      <div className="space-y-6">
        <PageHeader title="Subjects" description="Subjects overview" />
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-semibold">Not Available</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This module is optimised for the parent view.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects"
        description="View the subjects your child is enrolled in."
      />

      {!selectedChild ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No child selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a child from the switcher in the navbar to view their subjects.
          </p>
        </Card>
      ) : (
        <div className="space-y-5">
          {/* Child info banner */}
          <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {selectedChild.firstName} {selectedChild.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                Class: {selectedChild.className || 'Unknown'}
              </p>
            </div>
          </div>

          {isError && <QueryErrorBanner onRetry={refetch} />}

          <DataTable
            columns={columns}
            data={subjects}
            isLoading={isLoading}
            pageCount={1}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={setPagination}
          />
        </div>
      )}
    </div>
  );
}
