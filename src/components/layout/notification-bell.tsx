'use client';

import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useNotificationStore } from '@/lib/stores/notification-store';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from '@/lib/api/notifications';
import type { NotificationItem } from '@/lib/types/notifications';
import { queryClient } from '@/lib/query-client';

export function NotificationBell() {
  const router = useRouter();
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
// Fetch unread count on interval
  useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await getUnreadCount();
      setUnreadCount(res.data?.count ?? 0);
      return res;
    },
    enabled: !!schoolId,
    refetchInterval: 30_000,
  });

  // Fetch recent notifications for dropdown
  const { data: notifRes, isLoading } = useQuery({
    queryKey: ['notifications', 'recent', schoolId],
    queryFn: () => getNotifications({ size: 8, page: 0 }),
    enabled: !!schoolId,
    refetchInterval: 30_000,
  });

  const notifications = notifRes?.data ?? [];

  const markRead = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      setUnreadCount(0);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  function handleNotificationClick(notification: NotificationItem) {
    if (!notification.isRead) {
      markRead.mutate(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white',
                unreadCount > 99 ? 'h-5 min-w-5 px-1' : 'h-4 min-w-4 px-0.5',
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-[360px]">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                    !notification.isRead && 'bg-muted/30',
                  )}
                >
                  <div className="mt-1.5 shrink-0">
                    {!notification.isRead ? (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    ) : (
                      <div className="h-2 w-2" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
            onClick={() => router.push('/communication/notifications')}
          >
            View all notifications
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
