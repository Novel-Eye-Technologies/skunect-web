'use client';

import { useState, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { MoreHorizontal, Shield, UserX, Mail, Phone, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { InviteUserDialog } from '@/components/features/users/invite-user-dialog';
import { UserStatusDialog } from '@/components/features/users/user-status-dialog';
import { AssignClassDialog } from '@/components/features/teachers/assign-class-dialog';
import { TeacherOverviewCards } from '@/components/features/teachers/teacher-overview';
import { useTeachers } from '@/lib/hooks/use-teachers';
import { useRemoveUser } from '@/lib/hooks/use-users';
import { formatDate } from '@/lib/utils/format-date';
import type { UserListItem } from '@/lib/types/user';

export default function TeachersPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const [statusDialogUser, setStatusDialogUser] = useState<UserListItem | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [removeDialogUser, setRemoveDialogUser] = useState<UserListItem | null>(null);
  const [assignDialogUser, setAssignDialogUser] = useState<UserListItem | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const { data: response, isLoading } = useTeachers({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    status: statusFilter || undefined,
    search: search || undefined,
  });
  const removeUser = useRemoveUser();

  const teachers = response?.data ?? [];
  const pageCount = response?.meta?.totalPages ?? 0;

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    [],
  );

  function confirmRemoveUser() {
    if (!removeDialogUser) return;
    removeUser.mutate(removeDialogUser.id, {
      onSuccess: () => setRemoveDialogUser(null),
    });
  }

  const columns: ColumnDef<UserListItem>[] = [
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
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          {row.original.email}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) =>
        row.original.phone ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {row.original.phone}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) =>
        row.original.lastLogin
          ? formatDate(row.original.lastLogin)
          : 'Never',
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
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
                onClick={() => {
                  setAssignDialogUser(user);
                  setAssignDialogOpen(true);
                }}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Assign Class
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setStatusDialogUser(user);
                  setStatusDialogOpen(true);
                }}
              >
                <Shield className="mr-2 h-4 w-4" />
                Change Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setRemoveDialogUser(user)}
                className="text-destructive focus:text-destructive"
              >
                <UserX className="mr-2 h-4 w-4" />
                Remove Teacher
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description="Manage teachers in your school."
        actions={<InviteUserDialog defaultRole="TEACHER" buttonLabel="Add Teacher" />}
      />

      <TeacherOverviewCards />

      <DataTable
        columns={columns}
        data={teachers}
        isLoading={isLoading}
        pageCount={pageCount}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={handlePaginationChange}
        toolbarActions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
                className="h-8 w-[200px] pl-8"
              />
            </div>
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
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <AssignClassDialog
        teacher={assignDialogUser}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      />

      <UserStatusDialog
        user={statusDialogUser}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />

      <ConfirmDialog
        open={!!removeDialogUser}
        onOpenChange={(open) => {
          if (!open) setRemoveDialogUser(null);
        }}
        title="Remove Teacher"
        description={
          removeDialogUser
            ? `Are you sure you want to remove ${removeDialogUser.firstName} ${removeDialogUser.lastName} from this school? This action cannot be undone.`
            : ''
        }
        confirmLabel="Remove"
        onConfirm={confirmRemoveUser}
        isLoading={removeUser.isPending}
        variant="destructive"
      />
    </div>
  );
}
