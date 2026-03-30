'use client';

import {
  Bus,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  GraduationCap,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { useChildStore } from '@/lib/stores/child-store';
import { useBusTracking } from '@/lib/hooks/use-bus';
import { formatDateTime } from '@/lib/utils/format-date';
import type { BusTracking } from '@/lib/types/bus';

// ---------------------------------------------------------------------------
// Status colour mapping
// ---------------------------------------------------------------------------

const tripStatusColors: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const studentTripStatusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  BOARDED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DROPPED_OFF: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ABSENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const studentTripStatusIcons: Record<string, React.ElementType> = {
  PENDING: Clock,
  BOARDED: Bus,
  DROPPED_OFF: CheckCircle,
  ABSENT: XCircle,
};

// ---------------------------------------------------------------------------
// Tracking card per child
// ---------------------------------------------------------------------------

function TrackingCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-5 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChildBusTrackingCard({ childId, childName }: { childId: string; childName: string }) {
  const { data: response, isLoading } = useBusTracking(childId);

  if (isLoading) return <TrackingCardSkeleton />;

  const tracking: BusTracking | undefined = response?.data;

  if (!tracking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {childName}
          </CardTitle>
          <CardDescription>Not enrolled on any bus</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This child is not currently enrolled on a school bus route.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { enrollment, latestTrip, studentTripStatus } = tracking;
  const StatusIcon = studentTripStatus
    ? studentTripStatusIcons[studentTripStatus?.status ?? ""] ?? Clock
    : Clock;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              {childName}
            </CardTitle>
            <CardDescription>
              {enrollment?.routeName ?? 'No route assigned'}
            </CardDescription>
          </div>
          {latestTrip && (
            <Badge
              variant="secondary"
              className={tripStatusColors[latestTrip?.status ?? ""] ?? ''}
            >
              {latestTrip?.status?.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bus & Route Info */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Bus className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Bus</p>
              <p className="text-sm font-medium">
                {enrollment?.busPlateNumber ?? '-'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Pickup Point</p>
              <p className="text-sm font-medium">
                {enrollment?.pickupPoint ?? 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Latest Trip */}
        {latestTrip ? (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Latest Trip</p>
              <Badge variant="outline" className="text-xs">
                {latestTrip.tripType === 'MORNING_PICKUP'
                  ? 'Morning Pickup'
                  : 'Afternoon Drop-off'}
              </Badge>
            </div>

            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trip Date</span>
                <span>{latestTrip.tripDate}</span>
              </div>
            </div>

            {/* Student Trip Status */}
            {studentTripStatus && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                  <StatusIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {studentTripStatus?.status?.replace('_', ' ')}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${studentTripStatusColors[studentTripStatus?.status ?? ""] ?? ''}`}
                    >
                      {studentTripStatus.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {studentTripStatus.boardedAt && (
                      <span>Boarded: {formatDateTime(studentTripStatus.boardedAt)}</span>
                    )}
                    {studentTripStatus.boardedAt && studentTripStatus.droppedOffAt && (
                      <span className="mx-1">&middot;</span>
                    )}
                    {studentTripStatus.droppedOffAt && (
                      <span>Dropped off: {formatDateTime(studentTripStatus.droppedOffAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No trip data available yet for today.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BusTrackingPage() {
  const children = useChildStore((s) => s.children);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bus Tracking"
        description="Track your children's school bus status in real time."
      />

      {children.length === 0 ? (
        <EmptyState
          title="No children found"
          description="No children are linked to your account. Please contact the school admin."
          icon={GraduationCap}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {children.map((child) => (
            <ChildBusTrackingCard
              key={child.id}
              childId={child.id}
              childName={`${child.firstName} ${child.lastName}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
