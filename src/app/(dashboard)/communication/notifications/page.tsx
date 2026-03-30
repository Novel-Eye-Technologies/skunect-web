'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type PaginationState } from '@tanstack/react-table';
import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useUnreadCount,
} from '@/lib/hooks/use-notifications';
import { formatRelativeTime } from '@/lib/utils/format-relative-time';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/lib/types/notifications';

// ---------------------------------------------------------------------------
// Notification type icon helper
// ---------------------------------------------------------------------------
const typeIcons: Record<
  NotificationItem['type'],
  { icon: typeof Info; className: string }
> = {
  INFO: {
    icon: Info,
    className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  },
  WARNING: {
    icon: AlertTriangle,
    className:
      'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  },
  SUCCESS: {
    icon: CheckCircle2,
    className:
      'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
  ERROR: {
    icon: XCircle,
    className: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  },
};

export default function NotificationsPage() {
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [readFilter, setReadFilter] = useState<string>('');

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: response, isLoading } = useNotifications({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    read: readFilter === 'unread' ? false : readFilter === 'read' ? true : undefined,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  useUnreadCount();

  const notifications = response?.data ?? [];
  const totalPages = response?.meta?.totalPages ?? 0;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  function handleNotificationClick(notification: NotificationItem) {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  }

  const goToPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, pageIndex: page }));
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with important events and alerts."
        actions={
          <Button
            variant="outline"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            {markAllAsRead.isPending ? 'Marking...' : 'Mark All Read'}
          </Button>
        }
      />

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Select
          value={readFilter}
          onValueChange={(value) => {
            setReadFilter(value === 'ALL' ? '' : value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
        >
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-start gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={
            readFilter === 'unread'
              ? 'You have no unread notifications. Great job staying on top of things!'
              : 'You have no notifications yet. They will appear here when there are updates.'
          }
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const typeConfig = typeIcons[notification.type] ?? typeIcons.INFO;
            const TypeIcon = typeConfig.icon;

            return (
              <Card
                key={notification.id}
                role="button"
                tabIndex={0}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-accent/50',
                  !notification.isRead && 'border-l-4 border-l-primary',
                )}
                onClick={() => handleNotificationClick(notification)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNotificationClick(notification);
                  }
                }}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      typeConfig.className,
                    )}
                  >
                    <TypeIcon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={cn(
                          'text-sm',
                          !notification.isRead
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-foreground/80',
                        )}
                      >
                        {notification.title}
                      </h3>
                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary">
                          <span className="sr-only">Unread</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination — matches DataTable pattern */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground" />
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Per page</p>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(value) => {
                  setPagination({ pageIndex: 0, pageSize: Number(value) });
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {pagination.pageIndex + 1} of {totalPages || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="hidden h-8 w-8 lg:flex"
                onClick={() => goToPage(0)}
                disabled={pagination.pageIndex === 0}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(pagination.pageIndex - 1)}
                disabled={pagination.pageIndex === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => goToPage(pagination.pageIndex + 1)}
                disabled={pagination.pageIndex >= totalPages - 1}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="hidden h-8 w-8 lg:flex"
                onClick={() => goToPage(totalPages - 1)}
                disabled={pagination.pageIndex >= totalPages - 1}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
