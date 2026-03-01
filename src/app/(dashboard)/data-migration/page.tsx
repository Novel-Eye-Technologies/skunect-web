'use client';

import { useState, useCallback, useMemo } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { MigrationUpload } from '@/components/features/data-migration/migration-upload';
import { MigrationJobDetail } from '@/components/features/data-migration/migration-job-detail';
import { useMigrationJobs } from '@/lib/hooks/use-data-migration';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDateTime } from '@/lib/utils/format-date';
import type { MigrationJob, MigrationJobStatus } from '@/lib/types/data-migration';

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------
const JOB_STATUS_MAP: Record<
  MigrationJobStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-gray-100 text-gray-800',
    icon: Clock,
  },
  VALIDATING: {
    label: 'Validating',
    className: 'bg-yellow-100 text-yellow-800',
    icon: Loader2,
  },
  VALIDATED: {
    label: 'Validated',
    className: 'bg-blue-100 text-blue-800',
    icon: CheckCircle2,
  },
  IMPORTING: {
    label: 'Importing',
    className: 'bg-amber-100 text-amber-800',
    icon: Loader2,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

// ---------------------------------------------------------------------------
// Data type badge colors
// ---------------------------------------------------------------------------
const TYPE_COLORS: Record<string, string> = {
  STUDENTS: 'bg-[#2A9D8F]/10 text-[#2A9D8F]',
  TEACHERS: 'bg-[#1B2A4A]/10 text-[#1B2A4A]',
  CLASSES: 'bg-amber-100 text-amber-800',
  SUBJECTS: 'bg-purple-100 text-purple-800',
  FEES: 'bg-emerald-100 text-emerald-800',
};

export default function DataMigrationPage() {
  const currentRole = useAuthStore((s) => s.currentRole);

  // Only ADMIN can access data migration
  if (currentRole !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <PageHeader title="Data Migration" />
        <EmptyState
          title="Access Denied"
          description="Only administrators can access the data migration module."
          icon={ShieldAlert}
        />
      </div>
    );
  }

  return <DataMigrationContent />;
}

function DataMigrationContent() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: response, isLoading } = useMigrationJobs({
    page: pagination.pageIndex,
    size: pagination.pageSize,
  });

  const jobs = response?.data ?? [];
  const pageCount = response?.meta?.totalPages ?? 0;

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Table columns
  // ---------------------------------------------------------------------------
  const columns: ColumnDef<MigrationJob>[] = useMemo(
    () => [
      {
        accessorKey: 'fileName',
        header: 'File Name',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.fileName}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.original.type;
          return (
            <Badge
              variant="secondary"
              className={TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-800'}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const config = JOB_STATUS_MAP[status];
          const Icon = config.icon;
          const isSpinning =
            status === 'VALIDATING' || status === 'IMPORTING';
          return (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`gap-1 ${config.className}`}>
                <Icon
                  className={`h-3 w-3 ${isSpinning ? 'animate-spin' : ''}`}
                />
                {config.label}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'progress',
        header: 'Records',
        cell: ({ row }) => {
          const job = row.original;
          const pct =
            job.totalRecords > 0
              ? Math.round((job.processedRecords / job.totalRecords) * 100)
              : 0;
          return (
            <div className="flex items-center gap-2">
              <Progress value={pct} className="h-1.5 w-16" />
              <span className="text-xs text-muted-foreground">
                {job.processedRecords}/{job.totalRecords}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'successCount',
        header: 'Success',
        cell: ({ row }) => (
          <span className="text-[#2A9D8F]">{row.original.successCount}</span>
        ),
      },
      {
        accessorKey: 'errorCount',
        header: 'Errors',
        cell: ({ row }) => (
          <span
            className={
              row.original.errorCount > 0
                ? 'font-medium text-red-500'
                : 'text-muted-foreground'
            }
          >
            {row.original.errorCount}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedJobId(row.original.id)}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            View
          </Button>
        ),
      },
    ],
    [],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Migration"
        description="Import data from CSV files into the system."
      />

      {selectedJobId ? (
        <MigrationJobDetail
          jobId={selectedJobId}
          onBack={() => setSelectedJobId(null)}
        />
      ) : (
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <MigrationUpload />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {!isLoading && jobs.length === 0 ? (
              <EmptyState
                title="No migration jobs"
                description="Upload a CSV file to start your first data migration."
              />
            ) : (
              <DataTable
                columns={columns}
                data={jobs}
                isLoading={isLoading}
                pageCount={pageCount}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                onPaginationChange={handlePaginationChange}
                searchKey="fileName"
                searchPlaceholder="Search by file name..."
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
