'use client';

import { useState, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { type PaginationState } from '@tanstack/react-table';
import { MoreHorizontal, Shield, UserX, Pencil, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { InviteUserDialog } from '@/components/features/users/invite-user-dialog';
import { UserStatusDialog } from '@/components/features/users/user-status-dialog';
import { EditUserDialog } from '@/components/features/users/edit-user-dialog';
import { useUsers, useRemoveUser } from '@/lib/hooks/use-users';
import { formatDate } from '@/lib/utils/format-date';
import type { UserListItem } from '@/lib/types/user';

export default function AdminsPage() {
  // ---------------------------------------------------------------------------
  // Pagination and filter state
  // ---------------------------------------------------------------------------
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ---------------------------------------------------------------------------
  // Dialog state
  // ---------------------------------------------------------------------------
  const [editDialogUser, setEditDialogUser] = useState<UserListItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusDialogUser, setStatusDialogUser] = useState<UserListItem | null>(
    null,
  );
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [removeDialogUser, setRemoveDialogUser] = useState<UserListItem | null>(
    null,
  );

  // ---------------------------------------------------------------------------
  // Data fetching — always filter by ADMIN role
  // ---------------------------------------------------------------------------
  const { data: response, isLoading } = useUsers({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    role: 'ADMIN',
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });
  const removeUser = useRemoveUser();

  const admins = response?.data ?? [];
  const pageCount = response?.meta?.totalPages ?? 0;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    [],
  );

  function handleChangeStatus(user: UserListItem) {
    setStatusDialogUser(user);
    setStatusDialogOpen(true);
  }

  function handleRemoveUser(user: UserListItem) {
    setRemoveDialogUser(user);
  }

  function confirmRemoveUser() {
    if (!removeDialogUser) return;
    removeUser.mutate(removeDialogUser.id, {
      onSuccess: () => setRemoveDialogUser(null),
    });
  }

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------
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
                  setEditDialogUser(user);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeStatus(user)}>
                <Shield className="mr-2 h-4 w-4" />
                Change Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleRemoveUser(user)}
                className="text-destructive focus:text-destructive"
              >
                <UserX className="mr-2 h-4 w-4" />
                Remove Admin
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
        title="Admins"
        description="Manage administrators in your school."
        actions={<InviteUserDialog defaultRole="ADMIN" buttonLabel="Add Admin" />}
      />

      <DataTable
        columns={columns}
        data={admins}
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
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
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

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editDialogUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      {/* Change Status Dialog */}
      <UserStatusDialog
        user={statusDialogUser}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />

      {/* Remove Admin Confirmation */}
      <ConfirmDialog
        open={!!removeDialogUser}
        onOpenChange={(open) => {
          if (!open) setRemoveDialogUser(null);
        }}
        title="Remove Admin"
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
