'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { WelfareFormDialog } from '@/components/features/welfare/welfare-form-dialog';
import { useWelfareRecords } from '@/lib/hooks/use-welfare';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/lib/api/school-settings';
import type { WelfareRecord } from '@/lib/types/welfare';
import { FormDatePicker } from '@/components/shared/form-date-picker';

export default function WelfarePage() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);

  const { data: classesRes } = useQuery({
    queryKey: ['classes', schoolId ?? ''],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
  });

  const { data: response, isLoading } = useWelfareRecords({
    classId: classFilter || undefined,
    date: dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined,
  });

  const records = response?.data ?? [];
  const classes = classesRes?.data ?? [];

  const columns: ColumnDef<WelfareRecord>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.studentName}</div>
      ),
    },
    {
      accessorKey: 'className',
      header: 'Class',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {row.original.notes || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.date), 'MMM dd, yyyy'),
    },
    {
      accessorKey: 'recordedBy',
      header: 'Recorded By',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welfare & Behavior Logs"
        description="Record and track student welfare observations."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Welfare
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        toolbarActions={
          <div className="flex items-center gap-2">
            <Select
              value={classFilter}
              onValueChange={(value) =>
                setClassFilter(value === 'ALL' ? '' : value)
              }
            >
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDatePicker
              value={dateFilter}
              onChange={setDateFilter}
              placeholder="Filter by date"
            />
          </div>
        }
      />

      <WelfareFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        classes={classes}
      />
    </div>
  );
}
