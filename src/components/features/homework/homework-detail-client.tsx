'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
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
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDate, formatDateTime } from '@/lib/utils/format-date';
import type { Submission } from '@/lib/types/homework';

export function HomeworkDetailClient() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  // In a static export, useParams() may return the placeholder value ('_') when
  // nginx serves the pre-rendered page for a different dynamic segment.  Fall back
  // to extracting the real ID from the pathname.
  const rawParam = params.homeworkId as string;
  const homeworkId =
    !rawParam || rawParam === '_'
      ? pathname.split('/').filter(Boolean)[1] ?? rawParam
      : rawParam;

  const currentRole = useAuthStore((s) => s.currentRole);
  const isParent = currentRole === 'PARENT';
  const canManage = currentRole === 'TEACHER' || currentRole === 'ADMIN';

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
      id: 'feedback',
      header: 'Feedback',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.feedback ?? '-'}</span>
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
        description={`${homework.className ?? ''} - ${homework.subjectName ?? ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/homework')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {canManage && (
              <Button onClick={() => setEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        }
      />

      {isParent ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assignment Information</CardTitle>
                {homework.status ? <StatusBadge status={homework.status} /> : null}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoRow label="Class" value={homework.className ?? null} />
                <InfoRow label="Subject" value={homework.subjectName ?? null} />
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
                <InfoRow label="Created By" value={homework.createdBy ?? null} />
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
                Attachments ({homework.attachmentUrls?.filter(Boolean).length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!homework.attachmentUrls || homework.attachmentUrls.filter(Boolean).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No attachments.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {homework.attachmentUrls.filter((url): url is string => url !== null).map((url, index) => {
                    const fileName = (() => {
                      try {
                        const pathname = new URL(url).pathname;
                        return decodeURIComponent(pathname.split('/').pop() || url);
                      } catch {
                        return url.split('/').pop() || url;
                      }
                    })();
                    return (
                      <div
                        key={index}
                        className="flex items-start justify-between rounded-md border p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-md bg-muted p-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {fileName}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Download attachment"
                          asChild
                        >
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions ({homework.totalSubmissions ?? 0}/{homework.totalStudents ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* DETAILS TAB */}
        <TabsContent value="details">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Assignment Information</CardTitle>
                  {homework.status ? <StatusBadge status={homework.status} /> : null}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoRow label="Class" value={homework.className ?? null} />
                  <InfoRow label="Subject" value={homework.subjectName ?? null} />
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
                  <InfoRow label="Created By" value={homework.createdBy ?? null} />
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
                  Attachments ({homework.attachmentUrls?.filter(Boolean).length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!homework.attachmentUrls || homework.attachmentUrls.filter(Boolean).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No attachments.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {homework.attachmentUrls.filter((u): u is string => u !== null).map((url, index) => {
                      const fileName = (() => {
                        try {
                          const pathname = new URL(url).pathname;
                          return decodeURIComponent(pathname.split('/').pop() || url);
                        } catch {
                          return url.split('/').pop() || url;
                        }
                      })();
                      return (
                        <div
                          key={index}
                          className="flex items-start justify-between rounded-md border p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-md bg-muted p-2">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {fileName}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Download attachment"
                            asChild
                          >
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      );
                    })}
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
      )}

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
        maxScore={homework.maxScore ?? 100}
      />
    </div>
  );
}
