'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import { formatDate } from '@/lib/utils/format-date';

interface FeeInvoice {
  id: string;
  studentId: string;
  feeStructureId: string;
  feeStructureTitle: string;
  termName: string;
  amount: number;
  amountPaid: number;
  balance: number;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

async function getStudentFeeInvoices(
  schoolId: string,
  studentId: string,
): Promise<ApiResponse<FeeInvoice[]>> {
  const res = await apiClient.get<ApiResponse<FeeInvoice[]>>(
    `/schools/${schoolId}/students/${studentId}/fee-invoices`,
  );
  return res.data;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

interface StudentPaymentsTabProps {
  studentId: string;
}

export function StudentPaymentsTab({ studentId }: StudentPaymentsTabProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  const { data, isLoading } = useQuery({
    queryKey: ['student-fee-invoices', schoolId, studentId],
    queryFn: () => getStudentFeeInvoices(schoolId!, studentId),
    enabled: !!schoolId && !!studentId,
    select: (res) => res.data,
  });

  const invoices = data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Receipt className="mx-auto mb-2 h-8 w-8" />
          <p>No payment records found for this student.</p>
        </CardContent>
      </Card>
    );
  }

  // Summary stats
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalBalance = invoices.reduce((sum, inv) => sum + inv.balance, 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Billed</p>
            <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Outstanding Balance</p>
            <p className={`text-xl font-bold ${totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(totalBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      {invoices.map((inv) => (
        <Card key={inv.id}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-muted p-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{inv.feeStructureTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.termName}
                    {inv.dueDate && ` · Due: ${formatDate(inv.dueDate)}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrency(inv.amount)}</p>
                <StatusBadge status={inv.status} className="mt-1" />
              </div>
            </div>
            {inv.amountPaid > 0 && inv.balance > 0 && (
              <div className="mt-2 flex justify-between text-xs text-muted-foreground border-t pt-2">
                <span>Paid: {formatCurrency(inv.amountPaid)}</span>
                <span>Balance: {formatCurrency(inv.balance)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
