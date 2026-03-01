'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  ArrowLeft,
  Edit,
  Download,
  FileText,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { DataTable } from '@/components/shared/data-table';
import { HomeworkFormDialog } from '@/components/features/homework/homework-form-dialog';
import { GradeSubmissionDialog } from '@/components/features/homework/grade-submission-dialog';
import { useHomework, useSubmissions } from '@/lib/hooks/use-homework';
import { formatDate, formatDateTime } from '@/lib/utils/format-date';
import type { Submission } from '@/lib/types/homework';

export function HomeworkDetailClient() {
  const params = useParams();
  const router = useRouter();
  const homeworkId = params.homeworkId as string;

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: homework, isLoading } = useHomework(homeworkId);

  const [submissionPagination, setSubmissionPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  const { data: submissionsResponse, isLoading: submissionsLoading } =
    useSubmissions(homeworkId, {
      page: submissionPagination.pageIndex,
      size: submissionPagination.pageSize,
    });

  const submissions = submissionsResponse?.data ?? [];
  const submissionPageCount = submissionsResponse?.meta?.totalPages ?? 0;

  // ---------------------------------------------------------------------------
  // Dialog state
  // ---------------------------------------------------------------------------
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [gradeTarget, setGradeTarget] = useState<Submission | null>(null);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleSubmissionPaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setSubmissionPagination(newPagination);
    },
    [],
  );

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ---------------------------------------------------------------------------
  // Submission columns
  // ---------------------------------------------------------------------------
  const submissionColumns: ColumnDef<Submission>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.studentName}</span>
      ),
    },
    {
      accessorKey: 'admissionNumber',
      header: 'Admission No',
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted At',
      cell: ({ row }) => formatDateTime(row.original.submittedAt),
    },
    {
      id: 'attachments',
      header: 'Attachments',
      cell: ({ row }) => (
        <span>{row.original.attachments.length} file(s)</span>
      ),
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => {
        const score = row.original.score;
        return score !== null ? (
          <span>
            {score}/{homework?.maxScore ?? '-'}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGradeTarget(row.original)}
        >
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Grade
        </Button>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!homework) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/homework')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Homework
        </Button>
        <p className="text-muted-foreground">Homework not found.</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Info rows helper
  // ---------------------------------------------------------------------------
  function InfoRow({ label, value }: { label: string; value: string | null }) {
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{value ?? '-'}</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title={homework.title}
        description={`${homework.className} - ${homework.subjectName}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/homework')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions ({homework.totalSubmissions}/{homework.totalStudents})
          </TabsTrigger>
        </TabsList>

        {/* DETAILS TAB */}
        <TabsContent value="details">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Assignment Information</CardTitle>
                  <StatusBadge status={homework.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoRow label="Class" value={homework.className} />
                  <InfoRow label="Subject" value={homework.subjectName} />
                  <InfoRow
                    label="Max Score"
                    value={String(homework.maxScore)}
                  />
                  <InfoRow
                    label="Assigned Date"
                    value={formatDate(homework.assignedDate)}
                  />
                  <InfoRow
                    label="Due Date"
                    value={formatDate(homework.dueDate)}
                  />
                  <InfoRow label="Created By" value={homework.createdBy} />
                </div>

                <Separator className="my-4" />

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="whitespace-pre-wrap text-sm">
                    {homework.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Attachments ({homework.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {homework.attachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No attachments.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {homework.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-start justify-between rounded-md border p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-md bg-muted p-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.type} &middot;{' '}
                              {formatFileSize(attachment.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SUBMISSIONS TAB */}
        <TabsContent value="submissions">
          <DataTable
            columns={submissionColumns}
            data={submissions}
            isLoading={submissionsLoading}
            pageCount={submissionPageCount}
            pageIndex={submissionPagination.pageIndex}
            pageSize={submissionPagination.pageSize}
            onPaginationChange={handleSubmissionPaginationChange}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <HomeworkFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        homework={homework}
      />

      {/* Grade Submission Dialog */}
      <GradeSubmissionDialog
        open={!!gradeTarget}
        onOpenChange={(open) => {
          if (!open) setGradeTarget(null);
        }}
        submission={gradeTarget ?? undefined}
        homeworkId={homeworkId}
        maxScore={homework.maxScore}
      />
    </div>
  );
}
