'use client';

import { useState, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Plus,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CreateAlertDialog } from '@/components/features/safety/create-alert-dialog';
import { CreatePickupDialog } from '@/components/features/safety/create-pickup-dialog';
import {
  useEmergencyAlerts,
  useResolveEmergencyAlert,
  usePickupLogs,
  useVerifyPickupLog,
} from '@/lib/hooks/use-safety';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDateTime, formatRelative } from '@/lib/utils/format-date';
import { cn } from '@/lib/utils';
import { SEVERITY_BORDER_COLORS as severityBorderColors } from '@/lib/constants/wellness';
import type { EmergencyAlert } from '@/lib/types/safety';
import type { PickupLog } from '@/lib/types/safety';


// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SafetyPage() {
  const currentRole = useAuthStore((s) => s.currentRole);
  const isAdmin = currentRole === 'ADMIN';
  const isTeacher = currentRole === 'TEACHER';

  // Alert state
  const [createAlertOpen, setCreateAlertOpen] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<EmergencyAlert | null>(null);

  // Pickup state
  const [createPickupOpen, setCreatePickupOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [pickupPagination, setPickupPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: alertsResponse, isLoading: alertsLoading } = useEmergencyAlerts();
  const resolveAlert = useResolveEmergencyAlert();

  const { data: pickupResponse, isLoading: pickupLoading } = usePickupLogs({
    page: pickupPagination.pageIndex,
    size: pickupPagination.pageSize,
    date: dateFilter || undefined,
  });
  const verifyPickup = useVerifyPickupLog();

  const alerts = alertsResponse?.data ?? [];
  const pickupLogs = pickupResponse?.data ?? [];
  const pickupPageCount = pickupResponse?.meta?.totalPages ?? 0;

  // Sort alerts: active first, then by createdAt desc
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  function confirmResolveAlert() {
    if (!resolveTarget) return;
    resolveAlert.mutate(resolveTarget.id, {
      onSuccess: () => setResolveTarget(null),
    });
  }

  const handlePickupPaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPickupPagination(newPagination);
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Pickup columns
  // ---------------------------------------------------------------------------
  const pickupColumns: ColumnDef<PickupLog>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.studentName}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.admissionNumber}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'pickupPersonName',
      header: 'Pickup Person',
    },
    {
      accessorKey: 'relationship',
      header: 'Relationship',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'verifiedBy',
      header: 'Verified By',
      cell: ({ row }) => row.original.verifiedBy ?? '-',
    },
    {
      accessorKey: 'createdAt',
      header: 'Time',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const log = row.original;
        if (log.status === 'VERIFIED') return null;
        if (!isTeacher && !isAdmin) return null;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => verifyPickup.mutate(log.id)}
            disabled={verifyPickup.isPending}
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            Verify
          </Button>
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
        title="Safety"
        description="Manage emergency alerts and student pickup logs."
      />

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Emergency Alerts
          </TabsTrigger>
          <TabsTrigger value="pickups">
            <Shield className="mr-2 h-4 w-4" />
            Pickup Logs
          </TabsTrigger>
        </TabsList>

        {/* ----------------------------------------------------------------- */}
        {/* Emergency Alerts Tab                                                */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="alerts" className="space-y-4">
          {isAdmin && (
            <div className="flex justify-end">
              <Button
                onClick={() => setCreateAlertOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Alert
              </Button>
            </div>
          )}

          {alertsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 w-full rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sortedAlerts.length === 0 ? (
            <EmptyState
              title="No alerts"
              description="There are no emergency alerts at this time."
              icon={ShieldCheck}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sortedAlerts.map((alert) => {
                return (
                  <Card
                    key={alert.id}
                    className={cn(
                      'border-2 transition-colors',
                      alert.isActive
                        ? severityBorderColors[alert.severity]
                        : 'border-border',
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-full',
                              alert.isActive
                                ? 'bg-red-100 dark:bg-red-900/30'
                                : 'bg-muted',
                            )}
                          >
                            <AlertTriangle
                              className={cn(
                                'h-4 w-4',
                                alert.isActive
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-muted-foreground',
                              )}
                            />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {alert.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {formatRelative(alert.createdAt)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={alert.severity} />
                          <StatusBadge status={alert.isActive ? 'ACTIVE' : 'RESOLVED'} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Initiated by: {alert.initiatedBy}</span>
                        {alert.resolvedAt && (
                          <span>
                            Resolved: {formatDateTime(alert.resolvedAt)}
                          </span>
                        )}
                      </div>
                      {isAdmin && alert.isActive && (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setResolveTarget(alert)}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Resolve
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Pickup Logs Tab                                                     */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="pickups" className="space-y-4">
          <DataTable
            columns={pickupColumns}
            data={pickupLogs}
            isLoading={pickupLoading}
            pageCount={pickupPageCount}
            pageIndex={pickupPagination.pageIndex}
            pageSize={pickupPagination.pageSize}
            onPaginationChange={handlePickupPaginationChange}
            toolbarActions={
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setPickupPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                  className="h-8 w-[160px]"
                />
                {(isAdmin || isTeacher) && (
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => setCreatePickupOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Log
                  </Button>
                )}
              </div>
            }
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateAlertDialog
        open={createAlertOpen}
        onOpenChange={setCreateAlertOpen}
      />

      <CreatePickupDialog
        open={createPickupOpen}
        onOpenChange={setCreatePickupOpen}
      />

      <ConfirmDialog
        open={!!resolveTarget}
        onOpenChange={(open) => {
          if (!open) setResolveTarget(null);
        }}
        title="Resolve Alert"
        description={
          resolveTarget
            ? `Are you sure you want to resolve "${resolveTarget.title}"? This will mark the alert as resolved.`
            : ''
        }
        confirmLabel="Resolve"
        onConfirm={confirmResolveAlert}
        isLoading={resolveAlert.isPending}
      />
    </div>
  );
}
