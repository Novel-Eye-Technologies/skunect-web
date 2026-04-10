'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  ArrowLeft,
  Edit,
  Download,
  FileText,
  ClipboardCheck,
  Send,
  Paperclip,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { DataTable } from '@/components/shared/data-table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { HomeworkFormDialog } from '@/components/features/homework/homework-form-dialog';
import { GradeSubmissionDialog } from '@/components/features/homework/grade-submission-dialog';
import { useHomework, useSubmissions, useChildSubmission, useSubmitHomework } from '@/lib/hooks/use-homework';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useChildStore } from '@/lib/stores/child-store';
import { formatDate, formatDateTime } from '@/lib/utils/format-date';
import { uploadFile } from '@/lib/api/files';
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
  const selectedChildId = useChildStore((s) => s.selectedChildId);
  const submitHomework = useSubmitHomework();
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file, 'homework');
        setUploadedFiles((prev) => [...prev, { url, name: file.name }]);
      }
    } catch {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: homework, isLoading } = useHomework(homeworkId);
  const { data: childSubmission } = useChildSubmission(
    isParent ? selectedChildId : null,
    homeworkId,
  );

  const hasSubmitted = !!childSubmission;
  const canResubmit = hasSubmitted && homework?.allowResubmission;

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

  /** Extract a display name from a file URL. */
  function getFileNameFromUrl(url: string): string {
    try {
      const pathname = new URL(url, 'https://placeholder').pathname;
      const segments = pathname.split('/').filter(Boolean);
      return segments[segments.length - 1] ?? 'Attachment';
    } catch {
      return 'Attachment';
    }
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
                <StatusBadge status={homework.submissionStatus ?? homework.status ?? 'ACTIVE'} />
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
                        const pn = new URL(url).pathname;
                        return decodeURIComponent(pn.split('/').pop() || url);
                      } catch {
                        return url.split('/').pop() || url;
                      }
                    })();
                    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);
                    return isImage ? (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block h-40 overflow-hidden rounded-md border"
                      >
                        <Image
                          src={url}
                          alt={fileName}
                          fill
                          className="object-cover transition-opacity group-hover:opacity-80"
                        />
                        <div className="flex items-center justify-between px-3 py-2">
                          <p className="truncate text-xs text-muted-foreground">
                            {fileName}
                          </p>
                          <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </div>
                      </a>
                    ) : (
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

          {/* Submission Status (Parent) */}
          {selectedChildId && hasSubmitted && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Submission</CardTitle>
                  <StatusBadge status={childSubmission.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoRow
                    label="Submitted At"
                    value={formatDateTime(childSubmission.submittedAt)}
                  />
                  <InfoRow
                    label="Score"
                    value={
                      childSubmission.score != null
                        ? `${childSubmission.score}/${homework.maxScore ?? '-'}`
                        : '-'
                    }
                  />
                  <InfoRow label="Feedback" value={childSubmission.feedback ?? null} />
                </div>
                {childSubmission.parentNotes && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="text-sm">{childSubmission.parentNotes}</p>
                    </div>
                  </>
                )}
                {childSubmission.attachmentUrls && childSubmission.attachmentUrls.filter(Boolean).length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Submitted Attachments ({childSubmission.attachmentUrls.filter(Boolean).length})
                      </p>
                      <div className="space-y-1">
                        {childSubmission.attachmentUrls.filter((u): u is string => !!u).map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="truncate text-sm">
                                {getFileNameFromUrl(url)}
                              </span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" asChild>
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Homework (Parent) */}
          {selectedChildId && homework.status !== 'CLOSED' && (!hasSubmitted || canResubmit) && (
            <Card>
              <CardHeader>
                <CardTitle>{canResubmit ? 'Resubmit Homework' : 'Submit Homework'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="submission-notes">Notes (optional)</Label>
                    <Textarea
                      id="submission-notes"
                      placeholder="Add any notes about this submission..."
                      className="min-h-[80px] resize-none"
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                    />
                  </div>

                  {/* File Attachments */}
                  <div className="space-y-2">
                    <Label>Attachments (optional)</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".jpeg,.jpg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Paperclip className="mr-2 h-4 w-4" />
                      )}
                      {isUploading ? 'Uploading...' : 'Attach Files'}
                    </Button>
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={file.url}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="truncate text-sm">{file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      disabled={submitHomework.isPending || isUploading}
                      onClick={() => {
                        submitHomework.mutate(
                          {
                            studentId: selectedChildId,
                            homeworkId,
                            attachmentUrls: uploadedFiles.length > 0
                              ? uploadedFiles.map((f) => f.url)
                              : undefined,
                            notes: submissionNotes || undefined,
                          },
                          {
                            onSuccess: () => {
                              setSubmissionNotes('');
                              setUploadedFiles([]);
                            },
                          },
                        );
                      }}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {submitHomework.isPending ? 'Submitting...' : canResubmit ? 'Resubmit Homework' : 'Submit Homework'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
                    value={String(homework.maxScore ?? '-')}
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
                      const fileName = getFileNameFromUrl(url);
                      const isImage = /\.(png|jpe?g|gif|webp)$/i.test(url);
                      return isImage ? (
                        <a
                          key={`${url}-${index}`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block h-40 overflow-hidden rounded-md border"
                        >
                          <Image
                            src={url}
                            alt={fileName}
                            fill
                            className="object-cover transition-opacity group-hover:opacity-80"
                          />
                          <div className="flex items-center justify-between px-3 py-2">
                            <p className="truncate text-xs text-muted-foreground">
                              {fileName}
                            </p>
                            <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          </div>
                        </a>
                      ) : (
                        <div
                          key={`${url}-${index}`}
                          className="flex items-start justify-between rounded-md border p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-md bg-muted p-2">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium truncate max-w-[160px]">
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
