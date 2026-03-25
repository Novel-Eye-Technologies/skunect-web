'use client';

import { useState, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Trash2,
  Eye,
  Pencil,
  Plus,
  Send,
  EyeOff,
  FileIcon,
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { AnnouncementFormDialog } from '@/components/features/announcements/announcement-form-dialog';
import {
  useAnnouncements,
  useDeleteAnnouncement,
  usePublishAnnouncement,
  useUnpublishAnnouncement,
} from '@/lib/hooks/use-announcements';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDate, formatDateTime } from '@/lib/utils/format-date';
import { cn } from '@/lib/utils';
import type { Announcement } from '@/lib/types/announcements';

// ---------------------------------------------------------------------------
// Priority badge color helper
// ---------------------------------------------------------------------------
const priorityConfig: Record<string, { label: string; className: string }> = {
  LOW: {
    label: 'Low',
    className:
      'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400',
  },
  NORMAL: {
    label: 'Normal',
    className:
      'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  },
  HIGH: {
    label: 'High',
    className:
      'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
  },
  URGENT: {
    label: 'Urgent',
    className:
      'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  },
};

function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] ?? {
    label: priority,
    className: 'bg-gray-100 text-gray-800',
  };
  return (
    <Badge
      variant="secondary"
      className={cn('font-medium', config.className)}
    >
      {config.label}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Audience label helper
// ---------------------------------------------------------------------------
const audienceLabels: Record<string, string> = {
  ALL: 'All',
  TEACHERS: 'Teachers',
  PARENTS: 'Parents',
  STUDENTS: 'Students',
};

export default function AnnouncementsPage() {
  const currentRole = useAuthStore((s) => s.currentRole);
  const isAdmin = currentRole === 'ADMIN';
  const isTeacher = currentRole === 'TEACHER';

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [viewTarget, setViewTarget] = useState<Announcement | null>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: response, isLoading } = useAnnouncements({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    published: statusFilter === 'PUBLISHED' ? true : statusFilter === 'DRAFT' ? false : undefined,
  });

  const deleteAnnouncement = useDeleteAnnouncement();
  const publishAnnouncement = usePublishAnnouncement();
  const unpublishAnnouncement = useUnpublishAnnouncement();

  const announcements = response?.data ?? [];
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

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteAnnouncement.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------
  const columns: ColumnDef<Announcement>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <button
          className="font-medium text-primary hover:underline text-left"
          onClick={() => setViewTarget(row.original)}
        >
          {row.original.title}
        </button>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: 'targetAudience',
      header: 'Audience',
      cell: ({ row }) =>
        audienceLabels[row.original.targetAudience] ??
        row.original.targetAudience,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published At',
      cell: ({ row }) =>
        row.original.publishedAt
          ? formatDateTime(row.original.publishedAt)
          : '-',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const announcement = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewTarget(announcement)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuItem
                    onClick={() => setEditTarget(announcement)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  {announcement.status === 'DRAFT' ? (
                    <DropdownMenuItem
                      onClick={() =>
                        publishAnnouncement.mutate(announcement.id)
                      }
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Publish
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() =>
                        unpublishAnnouncement.mutate(announcement.id)
                      }
                    >
                      <EyeOff className="mr-2 h-4 w-4" />
                      Unpublish
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteTarget(announcement)}
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
        title="Announcements"
        description="Create and manage school-wide announcements."
        actions={
          isTeacher || isAdmin ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Announcement
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={announcements}
        isLoading={isLoading}
        pageCount={pageCount}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={handlePaginationChange}
        toolbarActions={
          <div className="flex items-center gap-2">
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
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Create Announcement Dialog */}
      <AnnouncementFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Edit Announcement Dialog */}
      <AnnouncementFormDialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        announcement={editTarget ?? undefined}
      />

      {/* View Announcement Dialog */}
      <Dialog
        open={!!viewTarget}
        onOpenChange={(open) => {
          if (!open) setViewTarget(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{viewTarget?.title}</DialogTitle>
            <DialogDescription>
              {viewTarget?.publishedAt
                ? `Published on ${formatDateTime(viewTarget.publishedAt)}`
                : `Created on ${viewTarget ? formatDate(viewTarget.createdAt) : ''}`}
            </DialogDescription>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge priority={viewTarget.priority} />
                <StatusBadge status={viewTarget.status} />
                <Badge variant="outline">
                  {audienceLabels[viewTarget.targetAudience] ??
                    viewTarget.targetAudience}
                </Badge>
              </div>
              {viewTarget.expiresAt && (
                <p className="text-sm text-muted-foreground">
                  Expires: {formatDate(viewTarget.expiresAt)}
                </p>
              )}
              <div className="rounded-md border p-4">
                <p className="text-sm whitespace-pre-wrap">
                  {viewTarget.content}
                </p>
              </div>
              {viewTarget.attachmentUrls &&
                viewTarget.attachmentUrls.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Attachments</p>
                    <ul className="space-y-1.5">
                      {viewTarget.attachmentUrls.map((url, index) => {
                        const fileName = (() => {
                          try {
                            const pathname = new URL(url).pathname;
                            return decodeURIComponent(pathname.split('/').pop() || url);
                          } catch {
                            return url.split('/').pop() || url;
                          }
                        })();
                        return (
                          <li key={index}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-primary hover:underline"
                            >
                              <FileIcon className="h-4 w-4 flex-shrink-0" />
                              {fileName}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Announcement"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        isLoading={deleteAnnouncement.isPending}
        variant="destructive"
      />
    </div>
  );
}
