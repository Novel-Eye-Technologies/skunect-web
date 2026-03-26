'use client';

import { useState, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  Bus,
  MapPin,
  Users,
  Route,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CreateRouteDialog } from '@/components/features/bus/create-route-dialog';
import { CreateBusDialog } from '@/components/features/bus/create-bus-dialog';
import { EnrollStudentDialog } from '@/components/features/bus/enroll-student-dialog';
import { CreateTripDialog } from '@/components/features/bus/create-trip-dialog';
import {
  useBusRoutes,
  useBuses,
  useBusEnrollments,
  useBusTrips,
  useDeleteBusRoute,
  useDeleteBus,
  useUnenrollStudent,
} from '@/lib/hooks/use-bus';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDateTime, formatDate } from '@/lib/utils/format-date';
import type { BusRoute } from '@/lib/types/bus';
import type { Bus as BusType } from '@/lib/types/bus';
import type { BusEnrollment } from '@/lib/types/bus';
import type { BusTrip } from '@/lib/types/bus';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BusManagementPage() {
  const currentRole = useAuthStore((s) => s.currentRole);
  const isAdmin = currentRole === 'ADMIN';

  // Dialog state
  const [createRouteOpen, setCreateRouteOpen] = useState(false);
  const [createBusOpen, setCreateBusOpen] = useState(false);
  const [enrollStudentOpen, setEnrollStudentOpen] = useState(false);
  const [createTripOpen, setCreateTripOpen] = useState(false);

  // Delete confirmations
  const [deleteRouteTarget, setDeleteRouteTarget] = useState<BusRoute | null>(null);
  const [deleteBusTarget, setDeleteBusTarget] = useState<BusType | null>(null);
  const [unenrollTarget, setUnenrollTarget] = useState<BusEnrollment | null>(null);

  // Pagination
  const [routesPagination, setRoutesPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [busesPagination, setBusesPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [enrollmentsPagination, setEnrollmentsPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [tripsPagination, setTripsPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: routesResponse, isLoading: routesLoading } = useBusRoutes({
    page: routesPagination.pageIndex,
    size: routesPagination.pageSize,
  });
  const { data: busesResponse, isLoading: busesLoading } = useBuses({
    page: busesPagination.pageIndex,
    size: busesPagination.pageSize,
  });
  const { data: enrollmentsResponse, isLoading: enrollmentsLoading } = useBusEnrollments({
    page: enrollmentsPagination.pageIndex,
    size: enrollmentsPagination.pageSize,
  });
  const { data: tripsResponse, isLoading: tripsLoading } = useBusTrips({
    page: tripsPagination.pageIndex,
    size: tripsPagination.pageSize,
  });

  const deleteRoute = useDeleteBusRoute();
  const deleteBus = useDeleteBus();
  const unenroll = useUnenrollStudent();

  const routes = routesResponse?.data ?? [];
  const buses = busesResponse?.data ?? [];
  const enrollments = enrollmentsResponse?.data ?? [];
  const trips = tripsResponse?.data ?? [];

  const routesPageCount = routesResponse?.meta?.totalPages ?? 0;
  const busesPageCount = busesResponse?.meta?.totalPages ?? 0;
  const enrollmentsPageCount = enrollmentsResponse?.meta?.totalPages ?? 0;
  const tripsPageCount = tripsResponse?.meta?.totalPages ?? 0;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  function confirmDeleteRoute() {
    if (!deleteRouteTarget) return;
    deleteRoute.mutate(deleteRouteTarget.id, {
      onSuccess: () => setDeleteRouteTarget(null),
    });
  }

  function confirmDeleteBus() {
    if (!deleteBusTarget) return;
    deleteBus.mutate(deleteBusTarget.id, {
      onSuccess: () => setDeleteBusTarget(null),
    });
  }

  function confirmUnenroll() {
    if (!unenrollTarget) return;
    unenroll.mutate(unenrollTarget.id, {
      onSuccess: () => setUnenrollTarget(null),
    });
  }

  const handleRoutesPaginationChange = useCallback(
    (newPagination: PaginationState) => setRoutesPagination(newPagination),
    [],
  );
  const handleBusesPaginationChange = useCallback(
    (newPagination: PaginationState) => setBusesPagination(newPagination),
    [],
  );
  const handleEnrollmentsPaginationChange = useCallback(
    (newPagination: PaginationState) => setEnrollmentsPagination(newPagination),
    [],
  );
  const handleTripsPaginationChange = useCallback(
    (newPagination: PaginationState) => setTripsPagination(newPagination),
    [],
  );

  // ---------------------------------------------------------------------------
  // Route columns
  // ---------------------------------------------------------------------------
  const routeColumns: ColumnDef<BusRoute>[] = [
    {
      accessorKey: 'routeName',
      header: 'Route Name',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.routeName}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.original.description ?? '-',
    },
    {
      accessorKey: 'pickupPoints',
      header: 'Pickup Points',
      cell: ({ row }) => {
        const points = row.original.pickupPoints;
        return points.length > 0 ? points.join(', ') : '-';
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        if (!isAdmin) return null;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteRouteTarget(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        );
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Bus columns
  // ---------------------------------------------------------------------------
  const busColumns: ColumnDef<BusType>[] = [
    {
      accessorKey: 'plateNumber',
      header: 'Plate Number',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.plateNumber}</div>
      ),
    },
    {
      accessorKey: 'routeName',
      header: 'Route',
      cell: ({ row }) => row.original.routeName ?? '-',
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
    },
    {
      accessorKey: 'driverName',
      header: 'Driver',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.driverName}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.driverPhone}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        if (!isAdmin) return null;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteBusTarget(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        );
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Enrollment columns
  // ---------------------------------------------------------------------------
  const enrollmentColumns: ColumnDef<BusEnrollment>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.studentName ?? '-'}</div>
      ),
    },
    {
      accessorKey: 'busPlateNumber',
      header: 'Bus',
      cell: ({ row }) => row.original.busPlateNumber ?? '-',
    },
    {
      accessorKey: 'routeName',
      header: 'Route',
      cell: ({ row }) => row.original.routeName ?? '-',
    },
    {
      accessorKey: 'pickupPoint',
      header: 'Pickup Point',
      cell: ({ row }) => row.original.pickupPoint ?? '-',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      accessorKey: 'enrolledAt',
      header: 'Enrolled',
      cell: ({ row }) => formatDateTime(row.original.enrolledAt),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        if (!isAdmin) return null;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUnenrollTarget(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        );
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Trip columns
  // ---------------------------------------------------------------------------
  const tripColumns: ColumnDef<BusTrip>[] = [
    {
      accessorKey: 'busId',
      header: 'Bus ID',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.busId.slice(0, 8)}...</div>
      ),
    },
    {
      accessorKey: 'tripDate',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.tripDate),
    },
    {
      accessorKey: 'tripType',
      header: 'Type',
      cell: ({ row }) => (
        <StatusBadge
          status={
            row.original.tripType === 'MORNING_PICKUP'
              ? 'MORNING_PICKUP'
              : 'AFTERNOON_DROP'
          }
        />
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'startedAt',
      header: 'Started',
      cell: ({ row }) => formatDateTime(row.original.startedAt),
    },
    {
      accessorKey: 'completedAt',
      header: 'Completed',
      cell: ({ row }) => formatDateTime(row.original.completedAt),
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bus Management"
        description="Manage school bus routes, buses, student enrollments, and trips."
      />

      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="routes">
            <Route className="mr-2 h-4 w-4" />
            Routes
          </TabsTrigger>
          <TabsTrigger value="buses">
            <Bus className="mr-2 h-4 w-4" />
            Buses
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            <Users className="mr-2 h-4 w-4" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="trips">
            <MapPin className="mr-2 h-4 w-4" />
            Trips
          </TabsTrigger>
        </TabsList>

        {/* ----------------------------------------------------------------- */}
        {/* Routes Tab                                                         */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="routes" className="space-y-4">
          <DataTable
            columns={routeColumns}
            data={routes}
            isLoading={routesLoading}
            pageCount={routesPageCount}
            pageIndex={routesPagination.pageIndex}
            pageSize={routesPagination.pageSize}
            onPaginationChange={handleRoutesPaginationChange}
            toolbarActions={
              isAdmin ? (
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => setCreateRouteOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Route
                </Button>
              ) : undefined
            }
          />
          {!routesLoading && routes.length === 0 && (
            <EmptyState
              title="No bus routes"
              description="Create your first bus route to get started."
              icon={Route}
            />
          )}
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Buses Tab                                                          */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="buses" className="space-y-4">
          <DataTable
            columns={busColumns}
            data={buses}
            isLoading={busesLoading}
            pageCount={busesPageCount}
            pageIndex={busesPagination.pageIndex}
            pageSize={busesPagination.pageSize}
            onPaginationChange={handleBusesPaginationChange}
            toolbarActions={
              isAdmin ? (
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => setCreateBusOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bus
                </Button>
              ) : undefined
            }
          />
          {!busesLoading && buses.length === 0 && (
            <EmptyState
              title="No buses"
              description="Register your first school bus."
              icon={Bus}
            />
          )}
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Enrollments Tab                                                    */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="enrollments" className="space-y-4">
          <DataTable
            columns={enrollmentColumns}
            data={enrollments}
            isLoading={enrollmentsLoading}
            pageCount={enrollmentsPageCount}
            pageIndex={enrollmentsPagination.pageIndex}
            pageSize={enrollmentsPagination.pageSize}
            onPaginationChange={handleEnrollmentsPaginationChange}
            toolbarActions={
              isAdmin ? (
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => setEnrollStudentOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Enroll Student
                </Button>
              ) : undefined
            }
          />
          {!enrollmentsLoading && enrollments.length === 0 && (
            <EmptyState
              title="No enrollments"
              description="Enroll students onto buses to get started."
              icon={Users}
            />
          )}
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Trips Tab                                                          */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="trips" className="space-y-4">
          <DataTable
            columns={tripColumns}
            data={trips}
            isLoading={tripsLoading}
            pageCount={tripsPageCount}
            pageIndex={tripsPagination.pageIndex}
            pageSize={tripsPagination.pageSize}
            onPaginationChange={handleTripsPaginationChange}
            toolbarActions={
              isAdmin ? (
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => setCreateTripOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Trip
                </Button>
              ) : undefined
            }
          />
          {!tripsLoading && trips.length === 0 && (
            <EmptyState
              title="No trips"
              description="Schedule your first bus trip."
              icon={MapPin}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateRouteDialog
        open={createRouteOpen}
        onOpenChange={setCreateRouteOpen}
      />
      <CreateBusDialog
        open={createBusOpen}
        onOpenChange={setCreateBusOpen}
      />
      <EnrollStudentDialog
        open={enrollStudentOpen}
        onOpenChange={setEnrollStudentOpen}
      />
      <CreateTripDialog
        open={createTripOpen}
        onOpenChange={setCreateTripOpen}
      />

      {/* Delete Confirmations */}
      <ConfirmDialog
        open={!!deleteRouteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteRouteTarget(null);
        }}
        title="Delete Route"
        description={
          deleteRouteTarget
            ? `Are you sure you want to delete "${deleteRouteTarget.routeName}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteRoute}
        isLoading={deleteRoute.isPending}
      />

      <ConfirmDialog
        open={!!deleteBusTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteBusTarget(null);
        }}
        title="Delete Bus"
        description={
          deleteBusTarget
            ? `Are you sure you want to delete bus "${deleteBusTarget.plateNumber}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteBus}
        isLoading={deleteBus.isPending}
      />

      <ConfirmDialog
        open={!!unenrollTarget}
        onOpenChange={(open) => {
          if (!open) setUnenrollTarget(null);
        }}
        title="Unenroll Student"
        description={
          unenrollTarget
            ? `Are you sure you want to remove "${unenrollTarget.studentName ?? 'this student'}" from the bus?`
            : ''
        }
        confirmLabel="Unenroll"
        onConfirm={confirmUnenroll}
        isLoading={unenroll.isPending}
      />
    </div>
  );
}
