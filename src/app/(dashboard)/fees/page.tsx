'use client';

import { useState, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Trash2,
  Pencil,
  Plus,
  CreditCard,
  Receipt,
  DollarSign,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { FeeStructureFormDialog } from '@/components/features/fees/fee-structure-form-dialog';
import { GenerateInvoicesDialog } from '@/components/features/fees/generate-invoices-dialog';
import { RecordPaymentDialog } from '@/components/features/fees/record-payment-dialog';
import {
  useFeeStructures,
  useDeleteFeeStructure,
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
  const currentRole = useAuthStore((s) => s.currentRole);
  const isParent = currentRole === 'PARENT';

  // ---------------------------------------------------------------------------
  // Fee Structures state
  // ---------------------------------------------------------------------------
  const [structurePagination, setStructurePagination] =
    useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [createStructureOpen, setCreateStructureOpen] = useState(false);
  const [editStructureTarget, setEditStructureTarget] =
    useState<FeeStructure | null>(null);
  const [deleteStructureTarget, setDeleteStructureTarget] =
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
  const [paymentTarget, setPaymentTarget] = useState<Invoice | null>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const { data: structuresResponse, isLoading: structuresLoading, isError: isStructuresError, refetch: refetchStructures } =
    useFeeStructures({
      page: structurePagination.pageIndex,
      size: structurePagination.pageSize,
    });
  const deleteFeeStructure = useDeleteFeeStructure();

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

  // Total balance across all loaded invoices (used for parent summary)
  const totalBalance = invoices.reduce((sum, inv) => sum + (inv.balance ?? 0), 0);

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

  function confirmDeleteStructure() {
    if (!deleteStructureTarget) return;
    deleteFeeStructure.mutate(deleteStructureTarget.id, {
      onSuccess: () => setDeleteStructureTarget(null),
    });
  }

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
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      id: 'mandatory',
      header: 'Mandatory',
      cell: ({ row }) => (
        <StatusBadge status={row.original.isMandatory ? 'MANDATORY' : 'OPTIONAL'} />
      ),
    },
    {
      accessorKey: 'deadline',
      header: 'Deadline',
      cell: ({ row }) => row.original.deadline ?? '-',
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteStructureTarget(structure)}
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
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => formatCurrency(row.original.totalAmount),
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
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {invoice.balance > 0 && (
                <DropdownMenuItem
                  onClick={() => setPaymentTarget(invoice)}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Record Payment
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
        title={isParent ? 'Fees' : 'Fees Management'}
        description={isParent ? 'View your fee invoices and payment status.' : 'Manage fee structures, invoices, and payments.'}
      />

      {isParent && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-lg bg-primary/10 p-3">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={isParent ? 'invoices' : 'structures'} className="space-y-4">
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
                        {cls.gradeLevel ? ` (${cls.gradeLevel})` : ''}
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

      <ConfirmDialog
        open={!!deleteStructureTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteStructureTarget(null);
        }}
        title="Delete Fee Structure"
        description={
          deleteStructureTarget
            ? `Are you sure you want to delete "${deleteStructureTarget.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteStructure}
        isLoading={deleteFeeStructure.isPending}
        variant="destructive"
      />

      <GenerateInvoicesDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
      />

      <RecordPaymentDialog
        open={!!paymentTarget}
        onOpenChange={(open) => {
          if (!open) setPaymentTarget(null);
        }}
        invoice={paymentTarget}
      />
    </div>
  );
}
