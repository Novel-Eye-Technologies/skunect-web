'use client';

import { useState, useCallback, useEffect } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { Users, UserCheck, UserX, Clock, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { AttendanceGrid } from '@/components/features/attendance/attendance-grid';
import { useAttendanceRecords } from '@/lib/hooks/use-attendance';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useChildStore } from '@/lib/stores/child-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/lib/api/school-settings';
import { getAttendanceOverview } from '@/lib/api/attendance';
import { formatDate } from '@/lib/utils/format-date';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorBanner } from '@/components/shared/query-error-banner';
import type { AttendanceRecord } from '@/lib/types/attendance';

export default function AttendancePage() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const currentRole = useAuthStore((s) => s.currentRole);
  const isParent = currentRole === 'PARENT';

  // ---------------------------------------------------------------------------
  // Parent Data (from store)
  // ---------------------------------------------------------------------------
  const { children, selectedChildId } = useChildStore();
  const selectedChild = children.find((c) => c.id === selectedChildId);

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

  // Sync classFilter for parents
  useEffect(() => {
    if (isParent && selectedChild) {
      setClassFilter(selectedChild.classId);
    }
  }, [isParent, selectedChild]);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: response, isLoading, isError, refetch } = useAttendanceRecords({
    classId: classFilter || undefined,
    date: dateFilter || undefined,
  });

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId ?? ''],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId && !isParent,
    select: (res) => res.data,
  });

  const { data: schoolOverview, isLoading: isLoadingOverview } = useQuery({
    queryKey: ['attendance', 'overview', schoolId ?? '', dateFilter],
    queryFn: () => getAttendanceOverview(schoolId!, dateFilter),
    enabled: !!schoolId && !!dateFilter && !isParent,
    select: (res) => res.data,
  });

  const rawRecords = response?.data ?? [];
  // Filter records for parents to only show the selected child
  const records = isParent 
    ? rawRecords.filter(r => r.studentId === selectedChildId)
    : rawRecords;
  const pageCount = isParent ? (records.length > 0 ? 1 : 0) : (response?.meta?.totalPages ?? 0);
  const classes = classesResponse ?? [];

  // Child-specific overview for parents based on the selected child's record today
  const childRecord = isParent ? records[0] : null;
  const overview = isParent ? {
    presentCount: childRecord?.status === 'PRESENT' ? 1 : 0,
    absentCount: childRecord?.status === 'ABSENT' ? 1 : 0,
    lateCount: childRecord?.status === 'LATE' ? 1 : 0,
    totalStudents: 1,
    attendanceRate: childRecord ? (childRecord.status === 'ABSENT' ? 0 : 100) : 0
  } : schoolOverview;

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
  ].filter((stat) => !isParent || stat.label !== 'Total Students');

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

  const renderRecords = () => (
    <div className="space-y-6">
      {isError && <QueryErrorBanner onRetry={refetch} />}
      {records.length === 0 && !isLoading ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No attendance records</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Attendance records will appear here once they are marked by the teacher.
          </p>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={records}
          isLoading={isLoading}
          pageCount={pageCount}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          onPaginationChange={handlePaginationChange}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description={isParent ? 'View student attendance records.' : 'Mark and view student attendance records.'}
      />

      {isParent && !selectedChild ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No child selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please select a child from the switcher in the navbar.
          </p>
        </Card>
      ) : (
        <>
          {/* Daily Overview */}
          {isLoadingOverview || (isParent && isLoading) ? (
            <div className={`grid gap-4 ${isParent ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
              {Array.from({ length: isParent ? 3 : 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-12 w-full rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`grid gap-4 ${isParent ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
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

          {isParent ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-bold">History of Attendance</CardTitle>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setPagination((p) => ({ ...p, pageIndex: 0 }));
                  }}
                  className="h-9 w-45"
                />
              </CardHeader>
              <CardContent>
                {renderRecords()}
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue={isParent ? 'records' : 'mark'} className="space-y-6">
              <TabsList>
                <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
                <TabsTrigger value="records">Records</TabsTrigger>
              </TabsList>

              <TabsContent value="mark" className="space-y-6">
                <AttendanceGrid />
              </TabsContent>

              <TabsContent value="records" className="space-y-6">
                {renderRecords()}
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
