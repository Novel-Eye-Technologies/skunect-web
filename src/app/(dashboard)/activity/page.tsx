'use client';

import { format, formatDistanceToNow } from 'date-fns';
import {
  ClipboardCheck,
  FileText,
  Bell,
  HeartPulse,
  Activity,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivityFeed } from '@/lib/hooks/use-activity';
import type { ActivityFeedItem } from '@/lib/types/activity';

const typeIcons: Record<string, typeof Activity> = {
  ATTENDANCE: ClipboardCheck,
  HOMEWORK: FileText,
  ANNOUNCEMENT: Bell,
  WELFARE: HeartPulse,
};

const typeColors: Record<string, string> = {
  ATTENDANCE: 'bg-blue-100 text-blue-700',
  HOMEWORK: 'bg-purple-100 text-purple-700',
  ANNOUNCEMENT: 'bg-amber-100 text-amber-700',
  WELFARE: 'bg-emerald-100 text-emerald-700',
};

function ActivityItem({ item }: { item: ActivityFeedItem }) {
  const Icon = typeIcons[item.type] ?? Activity;
  const colorClass = typeColors[item.type] ?? 'bg-gray-100 text-gray-700';
  const timestamp = new Date(item.timestamp);

  return (
    <div className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.title}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{item.actorName}</span>
          <span>&middot;</span>
          <time
            dateTime={item.timestamp}
            title={format(timestamp, 'PPpp')}
          >
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </time>
        </div>
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-lg border p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ActivityPage() {
  const { data: response, isLoading } = useActivityFeed(50);
  const activities = response?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Feed"
        description="Recent activity across the school."
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest attendance, homework, and announcement updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ActivitySkeleton />
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent activity to show.
            </p>
          ) : (
            <div className="space-y-3">
              {activities.map((item, index) => (
                <ActivityItem key={`${item.type}-${item.timestamp}-${index}`} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
