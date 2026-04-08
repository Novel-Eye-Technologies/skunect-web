'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { MoreHorizontal, Trash2, Eye, Pencil, Plus, BookOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { HomeworkFormDialog } from '@/components/features/homework/homework-form-dialog';
import { useHomeworkList, useDeleteHomework } from '@/lib/hooks/use-homework';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useChildStore } from '@/lib/stores/child-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses, getSubjects } from '@/lib/api/school-settings';
import { formatDate } from '@/lib/utils/format-date';
import { QueryErrorBanner } from '@/components/shared/query-error-banner';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/empty-state';
import { Card } from '@/components/ui/card';
import type { HomeworkListItem } from '@/lib/types/homework';

interface ChildHomeworkListProps {
  classId: string;
  childId: string;
}

function ChildHomeworkList({ classId }: ChildHomeworkListProps) {
  const router = useRouter();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: response, isLoading, isError, refetch } = useHomeworkList({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    classId,
    status: 'ACTIVE',
  });

  const homeworkList = response?.data ?? [];
  const pageCount = response?.meta?.totalPages ?? 0;

  const columns: ColumnDef<HomeworkListItem>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <button
          className="font-medium text-primary hover:underline text-left"
          onClick={() => router.push(`/homework/${row.original.id}`)}
        >
          {row.original.title}
        </button>
      ),
    },
    {
      accessorKey: 'subjectName',
      header: 'Subject',
      cell: ({ row }) => row.original.subjectName ?? '—',
    },
    {
      accessorKey: 'assignedDate',
      header: 'Assigned',
      cell: ({ row }) => formatDate(row.original.assignedDate),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => formatDate(row.original.dueDate),
    },
    {
      id: 'submissionStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.submissionStatus ?? row.original.status;
        return status ? <StatusBadge status={status} /> : '—';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/homework/${row.original.id}`)}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
      ),
    },
  ];

  if (isError) return <QueryErrorBanner onRetry={refetch} />;

  if (homeworkList.length === 0 && !isLoading) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No homework assigned"
        description="Assignments for this child will appear here once they are posted."
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={homeworkList}
      isLoading={isLoading}
      pageCount={pageCount}
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      onPaginationChange={setPagination}
    />
  );
}

export default function HomeworkPage() {
  const router = useRouter();
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const currentRole = useAuthStore((s) => s.currentRole);
  const isParent = currentRole === 'PARENT';
  const canManage = currentRole === 'TEACHER' || currentRole === 'ADMIN';

  // ---------------------------------------------------------------------------
  // Parent Data (from store)
  // ---------------------------------------------------------------------------
  const { children, selectedChildId } = useChildStore();
  const selectedChild = children.find((c) => c.id === selectedChildId);

  // ---------------------------------------------------------------------------
  // Teacher/Admin State
  // ---------------------------------------------------------------------------
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [classFilter, setClassFilter] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<HomeworkListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HomeworkListItem | null>(
    null,
  );

  // ---------------------------------------------------------------------------
  // Teacher/Admin Data fetching
  // ---------------------------------------------------------------------------
  const { data: response, isLoading, isError, refetch } = useHomeworkList({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    classId: classFilter || undefined,
    subjectId: subjectFilter || undefined,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });
  const deleteHomework = useDeleteHomework();

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId ?? ''],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId && !isParent,
    select: (res) => res.data,
  });

  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects', schoolId ?? ''],
    queryFn: () => getSubjects(schoolId!),
    enabled: !!schoolId && !isParent,
    select: (res) => res.data,
  });

  const homeworkList = response?.data ?? [];
  const pageCount = response?.meta?.totalPages ?? 0;
  const classes = classesResponse ?? [];
  const subjects = subjectsResponse ?? [];

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    [],
  );

  function confirmDeleteHomework() {
    if (!deleteTarget) return;
    deleteHomework.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  // ---------------------------------------------------------------------------
  // Columns (Teacher/Admin)
  // ---------------------------------------------------------------------------
  const columns: ColumnDef<HomeworkListItem>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <button
          className="font-medium text-primary hover:underline text-left"
          onClick={() => router.push(`/homework/${row.original.id}`)}
        >
          {row.original.title}
        </button>
      ),
    },
    {
      accessorKey: 'className',
      header: 'Class',
      cell: ({ row }) => row.original.className ?? '—',
    },
    {
      accessorKey: 'subjectName',
      header: 'Subject',
      cell: ({ row }) => row.original.subjectName ?? '—',
    },
    {
      accessorKey: 'assignedDate',
      header: 'Assigned Date',
      cell: ({ row }) => formatDate(row.original.assignedDate),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => formatDate(row.original.dueDate),
    },
    {
      id: 'submissions',
      header: 'Submissions',
      cell: ({ row }) => {
        const { totalSubmissions, totalStudents } = row.original;
        if (totalSubmissions == null || totalStudents == null) return '—';
        return <span>{totalSubmissions}/{totalStudents}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) =>
        row.original.status ? <StatusBadge status={row.original.status} /> : '—',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const homework = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/homework/${homework.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditTarget(homework)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteTarget(homework)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title="Homework"
        description={isParent ? "View homework assignments for your child." : "Manage homework assignments and submissions."}
        actions={
          canManage ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          ) : undefined
        }
      />

      {isParent ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Submitted</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pending</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Graded</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Overdue</span>
          </div>
          {!selectedChild ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No child selected</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Please select a child from the switcher in the navbar.
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
                    Class: {selectedChild.className}
                  </p>
                </div>
              </div>
              <ChildHomeworkList
                classId={selectedChild.classId ?? ''}
                childId={selectedChild.id}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          {isError && <QueryErrorBanner onRetry={refetch} />}
          <DataTable
            columns={columns}
            data={homeworkList}
            isLoading={isLoading}
            pageCount={pageCount}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={handlePaginationChange}
            toolbarActions={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search homework..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                    }}
                    className="h-8 w-[200px] pl-8"
                  />
                </div>
                <Select
                  value={classFilter}
                  onValueChange={(value) => {
                    setClassFilter(value === 'ALL' ? '' : value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                        {cls.gradeLevel ? ` (${cls.gradeLevel})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={subjectFilter}
                  onValueChange={(value) => {
                    setSubjectFilter(value === 'ALL' ? '' : value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Subjects</SelectItem>
                    {subjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value === 'ALL' ? '' : value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </>
      )}

      {/* Create Homework Dialog */}
      <HomeworkFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Edit Homework Dialog */}
      <HomeworkFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        homework={editTarget ?? undefined}
      />

      {/* Delete Homework Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Homework"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteHomework}
        isLoading={deleteHomework.isPending}
        variant="destructive"
      />
    </div>
  );
}
