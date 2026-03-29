'use client';

import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { GraduationCap, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { useClasses } from '@/lib/hooks/use-school-settings';
import type { SchoolClass } from '@/lib/types/school';

export default function AcademicClassesPage() {
  const router = useRouter();
  const { data: allClasses, isLoading } = useClasses();

  const classes = allClasses ?? [];

  const columns: ColumnDef<SchoolClass>[] = [
    {
      accessorKey: 'name',
      header: 'Class Name',
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium text-left hover:underline text-primary"
          onClick={() => router.push(`/academics/classes/${row.original.id}`)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: 'gradeLevel',
      header: 'Grade Level',
      cell: ({ row }) =>
        row.original.gradeLevel ? (
          <Badge variant="outline">{row.original.gradeLevel}</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">&mdash;</span>
        ),
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
    },
    {
      accessorKey: 'classTeacherName',
      header: 'Class Teacher',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.classTeacherName ?? '\u2014'}
        </span>
      ),
    },
    {
      accessorKey: 'studentCount',
      header: 'Students',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
          {row.original.studentCount ?? 0}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/academics/classes/${row.original.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="View all classes and their details."
      />

      <DataTable
        columns={columns}
        data={classes}
        isLoading={isLoading}
        pageCount={1}
        pageIndex={0}
        pageSize={classes.length || 10}
        onPaginationChange={() => {}}
      />
    </div>
  );
}
