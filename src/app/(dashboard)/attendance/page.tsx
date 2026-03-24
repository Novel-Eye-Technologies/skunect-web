'use client';

import { useState, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { AttendanceGrid } from '@/components/features/attendance/attendance-grid';
import { useAttendanceRecords } from '@/lib/hooks/use-attendance';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/lib/api/school-settings';
import { getAttendanceOverview } from '@/lib/api/attendance';
import { formatDate } from '@/lib/utils/format-date';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorBanner } from '@/components/shared/query-error-banner';
import type { AttendanceRecord } from '@/lib/types/attendance';

export default function AttendancePage() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(
    () => new Date().toISOString().split('T')[0],
  );

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: response, isLoading, isError, refetch } = useAttendanceRecords({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    classId: classFilter || undefined,
    date: dateFilter || undefined,
  });

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId ?? ''],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const { data: overview, isLoading: isLoadingOverview } = useQuery({
    queryKey: ['attendance', 'overview', schoolId ?? '', dateFilter],
    queryFn: () => getAttendanceOverview(schoolId!, dateFilter),
    enabled: !!schoolId && !!dateFilter,
    select: (res) => res.data,
  });

  const records = response?.data ?? [];
  const pageCount = response?.meta?.totalPages ?? 0;
  const classes = classesResponse ?? [];

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Overview stats
  // ---------------------------------------------------------------------------
  const overviewStats = [
    {
      label: 'Total Students',
      value: overview?.totalStudents ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Present',
      value: overview?.presentCount ?? 0,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      label: 'Absent',
      value: overview?.absentCount ?? 0,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
    },
    {
      label: 'Late',
      value: overview?.lateCount ?? 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
  ];

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------
  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.studentName}</div>
      ),
    },
    {
      accessorKey: 'admissionNumber',
      header: 'Admission No',
    },
    {
      accessorKey: 'className',
      header: 'Class',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'note',
      header: 'Note',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.note ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'markedBy',
      header: 'Marked By',
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark and view student attendance records."
      />

      {/* Daily Overview - always visible at top */}
      {isLoadingOverview ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-12 w-full rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters - below overview, above tabs */}
          {/* <div className="flex flex-wrap items-center gap-3">
            <Select
              value={classFilter || 'ALL'}
              onValueChange={(value) => {
                setClassFilter(value === 'ALL' ? '' : value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                    {cls.section ? ` (${cls.section})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="h-9 w-45"
            />
          </div> */}
          <div className="grid gap-4 md:grid-cols-4">
            {overviewStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {overview?.attendanceRate !== undefined && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Attendance Rate
                  </span>
                  <span className="text-lg font-bold">
                    {overview.attendanceRate}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${Math.min(overview.attendanceRate, 100)}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}



      {/* Two tabs only: Mark Attendance and Records */}
      <Tabs defaultValue="mark" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>

        {/* Mark Attendance Tab */}
        <TabsContent value="mark" className="space-y-6">
          <AttendanceGrid />
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-6">
          {isError && <QueryErrorBanner onRetry={refetch} />}
          <DataTable
            columns={columns}
            data={records}
            isLoading={isLoading}
            pageCount={pageCount}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={handlePaginationChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
