'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { HealthRecordFormDialog } from '@/components/features/welfare/health-record-form-dialog';
import { useHealthRecords } from '@/lib/hooks/use-health-records';
import type { HealthRecord } from '@/lib/types/health-record';
import { RECORD_TYPES, SEVERITY_OPTIONS } from '@/lib/types/health-record';

const severityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const recordTypeLabels: Record<string, string> = {
  ALLERGY: 'Allergy',
  CONDITION: 'Condition',
  MEDICATION: 'Medication',
  VACCINATION: 'Vaccination',
  INCIDENT: 'Incident',
  NOTE: 'Note',
};

export default function HealthRecordsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const { data: response, isLoading } = useHealthRecords({
    recordType: typeFilter || undefined,
  });
  const records = response?.data ?? [];

  const filteredRecords = severityFilter
    ? records.filter((r) => r.severity === severityFilter)
    : records;

  const columns: ColumnDef<HealthRecord>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.studentName}</div>
      ),
    },
    {
      accessorKey: 'recordType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {recordTypeLabels[row.original.recordType] ?? row.original.recordType}
        </Badge>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => {
        const severity = row.original.severity;
        if (!severity) return <span className="text-muted-foreground">&mdash;</span>;
        return (
          <Badge
            variant="secondary"
            className={severityColors[severity] ?? ''}
          >
            {severity}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={
            row.original.isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-700'
          }
        >
          {row.original.isActive ? 'Active' : 'Resolved'}
        </Badge>
      ),
    },
    {
      accessorKey: 'recordedAt',
      header: 'Date',
      cell: ({ row }) =>
        format(new Date(row.original.recordedAt), 'MMM dd, yyyy'),
    },
    {
      accessorKey: 'recordedByName',
      header: 'Recorded By',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health Records"
        description="Track student health information, allergies, and medical records."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filteredRecords}
        isLoading={isLoading}
        toolbarActions={
          <div className="flex items-center gap-2">
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value === 'ALL' ? '' : value)
              }
            >
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {RECORD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {recordTypeLabels[type] ?? type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={severityFilter}
              onValueChange={(value) =>
                setSeverityFilter(value === 'ALL' ? '' : value)
              }
            >
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue placeholder="All Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Severity</SelectItem>
                {SEVERITY_OPTIONS.map((sev) => (
                  <SelectItem key={sev} value={sev}>
                    {sev}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <HealthRecordFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
