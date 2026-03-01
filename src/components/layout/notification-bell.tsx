'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/lib/stores/notification-store';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <Link
      href="/communication/notifications"
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
    </Link>
  );
}
