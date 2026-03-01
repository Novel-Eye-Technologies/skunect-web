'use client';

import { useState, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Trash2,
  Eye,
  Pencil,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { AssessmentFormDialog } from '@/components/features/academics/assessment-form-dialog';
import { GradeEntryGrid } from '@/components/features/academics/grade-entry-grid';
import { ReportCardDialog } from '@/components/features/academics/report-card-dialog';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses, getSubjects, getTerms } from '@/lib/api/school-settings';
import { useSchoolSettings } from '@/lib/hooks/use-school-settings';
import {
  useAssessments,
  useDeleteAssessment,
  useReportCards,
  usePublishReportCard,
} from '@/lib/hooks/use-academics';
import { formatDate } from '@/lib/utils/format-date';
import type { Assessment, ReportCard } from '@/lib/types/academics';

export default function AcademicsPage() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  // ---------------------------------------------------------------------------
  // Shared data
  // ---------------------------------------------------------------------------
  const { data: settings } = useSchoolSettings();
  const currentSessionId = settings?.currentSessionId ?? '';

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: () => getSubjects(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const { data: termsResponse } = useQuery({
    queryKey: ['terms', schoolId, currentSessionId],
    queryFn: () => getTerms(schoolId!, currentSessionId),
    enabled: !!schoolId && !!currentSessionId,
    select: (res) => res.data,
  });

  const classes = classesResponse ?? [];
  const subjects = subjectsResponse ?? [];
  const terms = termsResponse ?? [];

  // ---------------------------------------------------------------------------
  // Assessments tab state
  // ---------------------------------------------------------------------------
  const [assessmentPagination, setAssessmentPagination] =
    useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [assessmentClassFilter, setAssessmentClassFilter] = useState('');
  const [assessmentSubjectFilter, setAssessmentSubjectFilter] = useState('');
  const [assessmentTermFilter, setAssessmentTermFilter] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Assessment | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Assessment | null>(null);

  const { data: assessmentsResponse, isLoading: isLoadingAssessments } =
    useAssessments({
      page: assessmentPagination.pageIndex,
      size: assessmentPagination.pageSize,
      classId: assessmentClassFilter || undefined,
      subjectId: assessmentSubjectFilter || undefined,
      termId: assessmentTermFilter || undefined,
    });

  const deleteAssessment = useDeleteAssessment();
  const assessments = assessmentsResponse?.data ?? [];
  const assessmentPageCount = assessmentsResponse?.meta?.totalPages ?? 0;

  const handleAssessmentPaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setAssessmentPagination(newPagination);
    },
    [],
  );

  function confirmDeleteAssessment() {
    if (!deleteTarget) return;
    deleteAssessment.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  // ---------------------------------------------------------------------------
  // Report Cards tab state
  // ---------------------------------------------------------------------------
  const [reportCardPagination, setReportCardPagination] =
    useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [rcClassFilter, setRcClassFilter] = useState('');
  const [rcTermFilter, setRcTermFilter] = useState('');
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  const { data: reportCardsResponse, isLoading: isLoadingReportCards } =
    useReportCards({
      classId: rcClassFilter || undefined,
      termId: rcTermFilter || undefined,
    });

  const publishReportCard = usePublishReportCard();
  const reportCards = reportCardsResponse?.data ?? [];
  const rcPageCount = reportCardsResponse?.meta?.totalPages ?? 0;

  const handleRcPaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setReportCardPagination(newPagination);
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Assessment Type Badge
  // ---------------------------------------------------------------------------
  function typeBadge(type: Assessment['type']) {
    const colors: Record<Assessment['type'], string> = {
      CA1: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      CA2: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      CA3: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      EXAM: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return (
      <Badge variant="secondary" className={colors[type]}>
        {type}
      </Badge>
    );
  }

  // ---------------------------------------------------------------------------
  // Assessment columns
  // ---------------------------------------------------------------------------
  const assessmentColumns: ColumnDef<Assessment>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    {
      accessorKey: 'className',
      header: 'Class',
    },
    {
      accessorKey: 'subjectName',
      header: 'Subject',
    },
    {
      accessorKey: 'termName',
      header: 'Term',
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => typeBadge(row.original.type),
    },
    {
      accessorKey: 'maxScore',
      header: 'Max Score',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const assessment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditTarget(assessment);
                  setCreateDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteTarget(assessment)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Report Card columns
  // ---------------------------------------------------------------------------
  const reportCardColumns: ColumnDef<ReportCard>[] = [
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
      accessorKey: 'termName',
      header: 'Term',
    },
    {
      accessorKey: 'totalScore',
      header: 'Total Score',
    },
    {
      accessorKey: 'average',
      header: 'Average',
      cell: ({ row }) => row.original.average.toFixed(1),
    },
    {
      accessorKey: 'position',
      header: 'Position',
      cell: ({ row }) => (
        <span>
          {row.original.position}/{row.original.totalStudents}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const card = row.original;
        if (card.status === 'DRAFT') {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => publishReportCard.mutate(card.id)}
              disabled={publishReportCard.isPending}
            >
              <Send className="mr-1 h-3 w-3" />
              Publish
            </Button>
          );
        }
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Published
          </Badge>
        );
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title="Academics"
        description="Manage assessments, grades, and report cards."
      />

      <Tabs defaultValue="assessments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="grades">Grade Entry</TabsTrigger>
          <TabsTrigger value="report-cards">Report Cards</TabsTrigger>
        </TabsList>

        {/* ----------------------------------------------------------------- */}
        {/* Assessments Tab                                                    */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="assessments" className="space-y-6">
          <DataTable
            columns={assessmentColumns}
            data={assessments}
            isLoading={isLoadingAssessments}
            pageCount={assessmentPageCount}
            pageIndex={assessmentPagination.pageIndex}
            pageSize={assessmentPagination.pageSize}
            onPaginationChange={handleAssessmentPaginationChange}
            toolbarActions={
              <div className="flex items-center gap-2">
                <Select
                  value={assessmentClassFilter}
                  onValueChange={(value) => {
                    setAssessmentClassFilter(value === 'ALL' ? '' : value);
                    setAssessmentPagination((prev) => ({
                      ...prev,
                      pageIndex: 0,
                    }));
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
                <Select
                  value={assessmentSubjectFilter}
                  onValueChange={(value) => {
                    setAssessmentSubjectFilter(value === 'ALL' ? '' : value);
                    setAssessmentPagination((prev) => ({
                      ...prev,
                      pageIndex: 0,
                    }));
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Subjects</SelectItem>
                    {subjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={assessmentTermFilter}
                  onValueChange={(value) => {
                    setAssessmentTermFilter(value === 'ALL' ? '' : value);
                    setAssessmentPagination((prev) => ({
                      ...prev,
                      pageIndex: 0,
                    }));
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="All Terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Terms</SelectItem>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditTarget(undefined);
                    setCreateDialogOpen(true);
                  }}
                >
                  Create Assessment
                </Button>
              </div>
            }
          />
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Grade Entry Tab                                                    */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="grades" className="space-y-6">
          <GradeEntryGrid />
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Report Cards Tab                                                   */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="report-cards" className="space-y-6">
          <DataTable
            columns={reportCardColumns}
            data={reportCards}
            isLoading={isLoadingReportCards}
            pageCount={rcPageCount}
            pageIndex={reportCardPagination.pageIndex}
            pageSize={reportCardPagination.pageSize}
            onPaginationChange={handleRcPaginationChange}
            toolbarActions={
              <div className="flex items-center gap-2">
                <Select
                  value={rcClassFilter}
                  onValueChange={(value) => {
                    setRcClassFilter(value === 'ALL' ? '' : value);
                    setReportCardPagination((prev) => ({
                      ...prev,
                      pageIndex: 0,
                    }));
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
                <Select
                  value={rcTermFilter}
                  onValueChange={(value) => {
                    setRcTermFilter(value === 'ALL' ? '' : value);
                    setReportCardPagination((prev) => ({
                      ...prev,
                      pageIndex: 0,
                    }));
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="All Terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Terms</SelectItem>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => setGenerateDialogOpen(true)}
                >
                  Generate Report Cards
                </Button>
              </div>
            }
          />
        </TabsContent>
      </Tabs>

      {/* Assessment Create/Edit Dialog */}
      <AssessmentFormDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditTarget(undefined);
        }}
        assessment={editTarget}
      />

      {/* Delete Assessment Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Assessment"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone and all associated scores will be lost.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteAssessment}
        isLoading={deleteAssessment.isPending}
        variant="destructive"
      />

      {/* Generate Report Cards Dialog */}
      <ReportCardDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
      />
    </div>
  );
}
