'use client';

import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMigrationJob } from '@/lib/hooks/use-data-migration';
import { formatDateTime } from '@/lib/utils/format-date';
import type { MigrationJobStatus } from '@/lib/types/data-migration';

interface MigrationJobDetailProps {
  jobId: string;
  onBack: () => void;
}

const STATUS_CONFIG: Record<
  MigrationJobStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }
> = {
  PENDING: { label: 'Pending', variant: 'outline', icon: Clock },
  VALIDATING: { label: 'Validating', variant: 'secondary', icon: Loader2 },
  VALIDATED: { label: 'Validated', variant: 'secondary', icon: CheckCircle2 },
  IMPORTING: { label: 'Importing', variant: 'default', icon: Loader2 },
  COMPLETED: { label: 'Completed', variant: 'default', icon: CheckCircle2 },
  FAILED: { label: 'Failed', variant: 'destructive', icon: XCircle },
};

export function MigrationJobDetail({ jobId, onBack }: MigrationJobDetailProps) {
  const { data: job, isLoading } = useMigrationJob(jobId);

  if (isLoading) {
    return <MigrationJobDetailSkeleton onBack={onBack} />;
  }

  if (!job) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to History
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Job not found.
        </p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[job.status];
  const StatusIcon = statusConfig.icon;
  const progressPercent =
    job.totalRecords > 0
      ? Math.round((job.processedRecords / job.totalRecords) * 100)
      : 0;
  const isInProgress =
    job.status === 'PENDING' ||
    job.status === 'VALIDATING' ||
    job.status === 'IMPORTING';

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to History
      </Button>

      {/* Job Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">{job.fileName}</CardTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Job ID: {job.id}
                </p>
              </div>
            </div>
            <Badge variant={statusConfig.variant} className="gap-1">
              <StatusIcon
                className={`h-3.5 w-3.5 ${isInProgress ? 'animate-spin' : ''}`}
              />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {job.processedRecords} / {job.totalRecords} records (
                {progressPercent}%)
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="mt-0.5 text-sm font-medium capitalize">
                {job.type.toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Successful</p>
              <p className="mt-0.5 text-sm font-medium text-[#2A9D8F]">
                {job.successCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Errors</p>
              <p className="mt-0.5 text-sm font-medium text-red-500">
                {job.errorCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="mt-0.5 text-sm font-medium">
                {formatDateTime(job.createdAt)}
              </p>
            </div>
          </div>

          {job.completedAt && (
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="mt-0.5 text-sm font-medium">
                {formatDateTime(job.completedAt)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error List */}
      {job.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <XCircle className="h-4 w-4 text-red-500" />
              Import Errors ({job.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Row</TableHead>
                    <TableHead className="w-32">Field</TableHead>
                    <TableHead>Error Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {job.errors.map((error, index) => (
                    <TableRow key={`error-${index}`}>
                      <TableCell className="font-mono text-xs">
                        {error.row}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {error.field}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {error.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MigrationJobDetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to History
      </Button>
      <Skeleton className="h-[280px] rounded-lg" />
      <Skeleton className="h-[200px] rounded-lg" />
    </div>
  );
}
