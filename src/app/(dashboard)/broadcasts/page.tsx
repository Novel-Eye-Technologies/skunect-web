'use client';

import { PageHeader } from '@/components/shared/page-header';
import { BroadcastDialog } from '@/components/features/broadcast/broadcast-dialog';
import { useBroadcasts } from '@/lib/hooks/use-broadcast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/format-date';
import { Send, Users } from 'lucide-react';

export default function BroadcastsPage() {
  const { data: response, isLoading } = useBroadcasts();
  const broadcasts = response?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Broadcasts"
        description="Send group messages to parents, teachers, or the whole school."
        actions={<BroadcastDialog />}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : broadcasts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Send className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No broadcasts sent yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{b.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{b.content}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span>By {b.sentByName}</span>
                      <span>{formatDate(b.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary">{b.targetType}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {b.recipientCount}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
