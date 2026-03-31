'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Plus,
  Phone,
  Users,
  QrCode,
  CalendarDays,
  XCircle,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CreateAuthorizationDialog } from '@/components/features/safety/create-authorization-dialog';
import {
  usePickupAuthorizations,
  useRevokePickupAuthorization,
} from '@/lib/hooks/use-safety';
import { getParentChildren } from '@/lib/api/students';
import { formatDateTime } from '@/lib/utils/format-date';
import type { PickupAuthorization } from '@/lib/types/safety';

export default function PickupAuthorizationPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [revokeTarget, setRevokeTarget] = useState<PickupAuthorization | null>(
    null,
  );

  // Fetch parent's children
  const { data: childrenResponse, isLoading: childrenLoading } = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: getParentChildren,
  });
  const children = useMemo(() => childrenResponse?.data ?? [], [childrenResponse?.data]);

  // Fetch authorizations (optionally filtered by child)
  const filterStudentId =
    selectedChildId === 'all' ? undefined : selectedChildId;
  const { data: authResponse, isLoading: authLoading } =
    usePickupAuthorizations(filterStudentId);
  const authorizations = useMemo(() => authResponse?.data ?? [], [authResponse?.data]);

  const revokeAuthorization = useRevokePickupAuthorization();

  // Group authorizations by student
  const grouped = useMemo(() => {
    const map = new Map<string, PickupAuthorization[]>();
    for (const auth of authorizations) {
      const key = auth.studentId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(auth);
    }
    return map;
  }, [authorizations]);

  // Build a lookup from studentId to child name
  const childNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const child of children) {
      map.set(child.id, `${child.firstName} ${child.lastName}`);
    }
    return map;
  }, [children]);

  const getQrImageUrl = useCallback(
    (qrCode: string) =>
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`,
    [],
  );

  const handleDownloadQr = useCallback(
    async (auth: PickupAuthorization) => {
      try {
        const url = getQrImageUrl(auth.qrCode);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch QR code image');
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `pickup-qr-${auth.pickupPersonName.replace(/\s+/g, '-').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch {
        toast.error('Failed to download QR code');
      }
    },
    [getQrImageUrl],
  );

  function confirmRevoke() {
    if (!revokeTarget) return;
    revokeAuthorization.mutate(revokeTarget.id, {
      onSuccess: () => setRevokeTarget(null),
    });
  }

  const isLoading = childrenLoading || authLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pickup Authorization"
        description="Manage authorized pickup persons for your children."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Authorization
          </Button>
        }
      />

      {/* Child filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground">
          Filter by child:
        </label>
        <Select value={selectedChildId} onValueChange={setSelectedChildId}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="All children" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All children</SelectItem>
            {children.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : authorizations.length === 0 ? (
        <EmptyState
          title="No pickup authorizations"
          description="You have not created any pickup authorizations yet. Add one to allow authorized persons to pick up your children."
          icon={ShieldCheck}
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Authorization
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([studentId, auths]) => (
            <div key={studentId} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                {childNameMap.get(studentId) ?? 'Unknown Student'}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {auths.map((auth) => (
                  <Card key={auth.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {auth.pickupPersonName}
                            </CardTitle>
                            {auth.pickupPersonRelationship && (
                              <CardDescription className="text-xs">
                                {auth.pickupPersonRelationship}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <StatusBadge
                          status={auth.isActive ? 'ACTIVE' : 'REVOKED'}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Phone */}
                      {auth.pickupPersonPhone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{auth.pickupPersonPhone}</span>
                        </div>
                      )}

                      {/* QR Code */}
                      {auth.qrCode && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <QrCode className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">
                              Pickup QR Code
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <img
                              src={getQrImageUrl(auth.qrCode)}
                              alt={`QR code for ${auth.pickupPersonName}`}
                              width={80}
                              height={80}
                              className="rounded border"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadQr(auth)}
                            >
                              <Download className="mr-1 h-4 w-4" />
                              Download QR
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>
                          {auth.validFrom
                            ? `${formatDateTime(auth.validFrom)}`
                            : 'No start date'}{' '}
                          &mdash;{' '}
                          {auth.validUntil
                            ? `${formatDateTime(auth.validUntil)}`
                            : 'No end date'}
                        </span>
                      </div>

                      {/* Created */}
                      <div className="text-xs text-muted-foreground">
                        Created: {formatDateTime(auth.createdAt)}
                      </div>

                      {/* Revoke action */}
                      {auth.isActive && (
                        <div className="flex justify-end pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setRevokeTarget(auth)}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Revoke
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateAuthorizationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        childrenList={children}
      />

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
        title="Revoke Authorization"
        description={
          revokeTarget
            ? `Are you sure you want to revoke pickup authorization for "${revokeTarget.pickupPersonName}"? They will no longer be able to pick up your child.`
            : ''
        }
        confirmLabel="Revoke"
        onConfirm={confirmRevoke}
        isLoading={revokeAuthorization.isPending}
      />
    </div>
  );
}
