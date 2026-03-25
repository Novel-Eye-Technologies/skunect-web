'use client';

import { useState, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Receipt,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { FeeStructureFormDialog } from '@/components/features/fees/fee-structure-form-dialog';
import { GenerateInvoicesDialog } from '@/components/features/fees/generate-invoices-dialog';
import {
  useFeeStructures,
  useInvoices,
} from '@/lib/hooks/use-fees';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/lib/api/school-settings';
import { formatCurrency } from '@/lib/utils/format-currency';
import { QueryErrorBanner } from '@/components/shared/query-error-banner';
import type { FeeStructure } from '@/lib/types/fees';
import type { Invoice } from '@/lib/types/fees';

export default function FeesPage() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  // ---------------------------------------------------------------------------
  // Fee Structures state
  // ---------------------------------------------------------------------------
  const [structurePagination, setStructurePagination] =
    useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [createStructureOpen, setCreateStructureOpen] = useState(false);
  const [editStructureTarget, setEditStructureTarget] =
    useState<FeeStructure | null>(null);

  // ---------------------------------------------------------------------------
  // Invoices state
  // ---------------------------------------------------------------------------
  const [invoicePagination, setInvoicePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: structuresResponse, isLoading: structuresLoading, isError: isStructuresError, refetch: refetchStructures } =
    useFeeStructures({
      page: structurePagination.pageIndex,
      size: structurePagination.pageSize,
    });

  const { data: invoicesResponse, isLoading: invoicesLoading, isError: isInvoicesError, refetch: refetchInvoices } = useInvoices({
    page: invoicePagination.pageIndex,
    size: invoicePagination.pageSize,
    status: statusFilter || undefined,
    classId: classFilter || undefined,
  });

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId ?? ''],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const structures = structuresResponse?.data ?? [];
  const structurePageCount = structuresResponse?.meta?.totalPages ?? 0;
  const invoices = invoicesResponse?.data ?? [];
  const invoicePageCount = invoicesResponse?.meta?.totalPages ?? 0;
  const classes = classesResponse ?? [];

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleStructurePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setStructurePagination(newPagination);
    },
    [],
  );

  const handleInvoicePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setInvoicePagination(newPagination);
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Fee Structure columns
  // ---------------------------------------------------------------------------
  const structureColumns: ColumnDef<FeeStructure>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.description ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'className',
      header: 'Class',
      cell: ({ row }) => row.original.className ?? 'All Classes',
    },
    {
      accessorKey: 'termName',
      header: 'Term',
      cell: ({ row }) => row.original.termName ?? '-',
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const structure = row.original;
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
                onClick={() => setEditStructureTarget(structure)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Invoice columns
  // ---------------------------------------------------------------------------
  const invoiceColumns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice No',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.invoiceNumber}</span>
      ),
    },
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.studentName}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.admissionNumber}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'className',
      header: 'Class',
    },
    {
      accessorKey: 'feeStructureName',
      header: 'Fee',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'amountPaid',
      header: 'Paid',
      cell: ({ row }) => (
        <span className="text-green-600">
          {formatCurrency(row.original.amountPaid)}
        </span>
      ),
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ row }) => (
        <span
          className={
            row.original.balance > 0 ? 'text-red-600 font-medium' : ''
          }
        >
          {formatCurrency(row.original.balance)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees Management"
        description="Manage fee structures, invoices, and payments."
      />

      <Tabs defaultValue="structures" className="space-y-4">
        <TabsList>
          <TabsTrigger value="structures">
            <DollarSign className="mr-2 h-4 w-4" />
            Fee Structures
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <Receipt className="mr-2 h-4 w-4" />
            Invoices
          </TabsTrigger>
        </TabsList>

        {/* ----------------------------------------------------------------- */}
        {/* Fee Structures Tab                                                  */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="structures" className="space-y-4">
          {isStructuresError && <QueryErrorBanner onRetry={refetchStructures} />}
          <DataTable
            columns={structureColumns}
            data={structures}
            isLoading={structuresLoading}
            pageCount={structurePageCount}
            pageIndex={structurePagination.pageIndex}
            pageSize={structurePagination.pageSize}
            onPaginationChange={handleStructurePaginationChange}
            toolbarActions={
              <Button
                size="sm"
                className="h-8"
                onClick={() => setCreateStructureOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Structure
              </Button>
            }
          />
        </TabsContent>

        {/* ----------------------------------------------------------------- */}
        {/* Invoices Tab                                                        */}
        {/* ----------------------------------------------------------------- */}
        <TabsContent value="invoices" className="space-y-4">
          {isInvoicesError && <QueryErrorBanner onRetry={refetchInvoices} />}
          <DataTable
            columns={invoiceColumns}
            data={invoices}
            isLoading={invoicesLoading}
            pageCount={invoicePageCount}
            pageIndex={invoicePagination.pageIndex}
            pageSize={invoicePagination.pageSize}
            onPaginationChange={handleInvoicePaginationChange}
            toolbarActions={
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value === 'ALL' ? '' : value);
                    setInvoicePagination((prev) => ({
                      ...prev,
                      pageIndex: 0,
                    }));
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={classFilter}
                  onValueChange={(value) => {
                    setClassFilter(value === 'ALL' ? '' : value);
                    setInvoicePagination((prev) => ({
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
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => setGenerateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Invoices
                </Button>
              </div>
            }
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <FeeStructureFormDialog
        open={createStructureOpen}
        onOpenChange={setCreateStructureOpen}
      />

      <FeeStructureFormDialog
        open={!!editStructureTarget}
        onOpenChange={(open) => {
          if (!open) setEditStructureTarget(null);
        }}
        feeStructure={editStructureTarget ?? undefined}
      />

      <GenerateInvoicesDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
      />

    </div>
  );
}
