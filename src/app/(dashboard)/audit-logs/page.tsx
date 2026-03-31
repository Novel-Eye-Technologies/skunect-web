'use client';

import { useState, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuditLogs } from '@/lib/hooks/use-audit';
import { formatDate } from '@/lib/utils/format-date';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AuditLog } from '@/lib/types/audit';

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  PUBLISH: 'bg-purple-100 text-purple-800',
};

export default function AuditLogsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: response, isLoading } = useAuditLogs({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    entityType: entityType || undefined,
    action: action || undefined,
    search: searchQuery || undefined,
  });

  const logs = response?.data ?? [];
  const pageCount = response?.meta?.totalPages ?? 0;

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => setPagination(newPagination),
    [],
  );

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => <span className="font-medium">{row.original.userName}</span>,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <Badge className={ACTION_COLORS[row.original.action] ?? ''} variant="secondary">
          {row.original.action}
        </Badge>
      ),
    },
    {
      accessorKey: 'entityType',
      header: 'Entity',
      cell: ({ row }) => <span className="capitalize">{row.original.entityType.toLowerCase()}</span>,
    },
    {
      accessorKey: 'details',
      header: 'Details',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {row.original.details ?? '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Trail"
        description="View a log of all admin actions in the system."
      />

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        pageCount={pageCount}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={handlePaginationChange}
        toolbarActions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }}
                className="h-8 w-[200px] pl-8"
              />
            </div>
            <Select
              value={entityType}
              onValueChange={(v) => {
                setEntityType(v === 'ALL' ? '' : v);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Entities</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="FEE">Fee</SelectItem>
                <SelectItem value="REPORT_CARD">Report Card</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={action}
              onValueChange={(v) => {
                setAction(v === 'ALL' ? '' : v);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="PUBLISH">Publish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
