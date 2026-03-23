'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { StudentFormDialog } from '@/components/features/students/student-form-dialog';
import { useStudents, useDeleteStudent } from '@/lib/hooks/use-students';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/lib/api/school-settings';
import { QueryErrorBanner } from '@/components/shared/query-error-banner';
import type { StudentListItem } from '@/lib/types/student';

export default function StudentsPage() {
  const router = useRouter();
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const role = useAuthStore((s) => s.currentRole);
  const isParent = role === 'PARENT';
  const isTeacher = role === 'TEACHER';

  // ---------------------------------------------------------------------------
  // Pagination, filter, and search state
  // ---------------------------------------------------------------------------
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [classFilter, setClassFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StudentListItem | null>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: response, isLoading, isError, refetch } = useStudents({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    classId: classFilter || undefined,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });
  const deleteStudent = useDeleteStudent();

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId ?? ''],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const students = response?.data ?? [];
  const pageCount = response?.meta?.totalPages ?? 0;
  const classes = classesResponse ?? [];

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    [],
  );

  function confirmDeleteStudent() {
    if (!deleteTarget) return;
    deleteStudent.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------
  const columns: ColumnDef<StudentListItem>[] = [
    {
      accessorKey: 'photo',
      header: '',
      cell: ({ row }) => {
        const student = row.original;
        const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`;
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={student.photo ?? undefined} alt={initials} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'admissionNumber',
      header: 'Admission No',
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.firstName} {row.original.lastName}
        </div>
      ),
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.gender.toLowerCase()}
        </span>
      ),
    },
    {
      accessorKey: 'className',
      header: 'Class',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const student = row.original;
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
                onClick={() => router.push(`/students/${student.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {(!isParent && !isTeacher) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteTarget(student)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
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
        title={isParent ? 'My Children' : 'Students'}
        description={
          isParent
            ? 'View your children and their school information.'
            : 'Manage student records and information.'
        }
        actions={
          (!isParent && !isTeacher) ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              Add Student
            </Button>
          ) : undefined
        }
      />

      {isError && <QueryErrorBanner onRetry={refetch} />}
      <DataTable
        columns={columns}
        data={students}
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
                placeholder="Search students..."
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
                    {cls.section ? ` (${cls.section})` : ''}
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
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="GRADUATED">Graduated</SelectItem>
                <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="EXPELLED">Expelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Create Student Dialog */}
      <StudentFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Delete Student Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Student"
        description={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteStudent}
        isLoading={deleteStudent.isPending}
        variant="destructive"
      />
    </div>
  );
}
