'use client';

import { useState, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { AttendanceGrid } from '@/components/features/attendance/attendance-grid';
import { useAttendanceRecords } from '@/lib/hooks/use-attendance';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/lib/api/school-settings';
import { formatDate } from '@/lib/utils/format-date';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { AttendanceRecord } from '@/lib/types/attendance';

export default function AttendancePage() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  // ---------------------------------------------------------------------------
  // Records tab state
  // ---------------------------------------------------------------------------
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: response, isLoading } = useAttendanceRecords({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    classId: classFilter || undefined,
    date: dateFilter || undefined,
  });

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
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
          <DataTable
            columns={columns}
            data={records}
            isLoading={isLoading}
            pageCount={pageCount}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={handlePaginationChange}
            toolbarActions={
              <div className="flex items-center gap-2">
                <Select
                  value={classFilter}
                  onValueChange={(value) => {
                    setClassFilter(value === 'ALL' ? '' : value);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px]">
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
                  className="h-8 w-[160px]"
                />
              </div>
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
