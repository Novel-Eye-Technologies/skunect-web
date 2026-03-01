'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  getInvoices,
  getInvoice,
  generateInvoices,
  recordPayment,
  type InvoiceListParams,
} from '@/lib/api/fees';
import type {
  CreateFeeStructureRequest,
  UpdateFeeStructureRequest,
  GenerateInvoicesRequest,
  RecordPaymentRequest,
} from '@/lib/types/fees';
import type { PaginatedParams } from '@/lib/api/types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const feesKeys = {
  all: ['fees'] as const,
  structures: (schoolId: string, params?: PaginatedParams) =>
    [...feesKeys.all, 'structures', schoolId, params] as const,
  invoices: (schoolId: string, params?: InvoiceListParams) =>
    [...feesKeys.all, 'invoices', schoolId, params] as const,
  invoice: (schoolId: string, invoiceId: string) =>
    [...feesKeys.all, 'invoice', schoolId, invoiceId] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useFeeStructures(params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: feesKeys.structures(schoolId!, params),
    queryFn: () => getFeeStructures(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useInvoices(params?: InvoiceListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: feesKeys.invoices(schoolId!, params),
    queryFn: () => getInvoices(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useInvoice(invoiceId: string) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: feesKeys.invoice(schoolId!, invoiceId),
    queryFn: () => getInvoice(schoolId!, invoiceId),
    enabled: !!schoolId && !!invoiceId,
    select: (response) => response.data,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateFeeStructure() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeeStructureRequest) =>
      createFeeStructure(schoolId!, data),
    onSuccess: () => {
      toast.success('Fee structure created');
      queryClient.invalidateQueries({ queryKey: feesKeys.all });
    },
    onError: () => {
      toast.error('Failed to create fee structure');
    },
  });
}

export function useUpdateFeeStructure() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feeStructureId,
      data,
    }: {
      feeStructureId: string;
      data: UpdateFeeStructureRequest;
    }) => updateFeeStructure(schoolId!, feeStructureId, data),
    onSuccess: () => {
      toast.success('Fee structure updated');
      queryClient.invalidateQueries({ queryKey: feesKeys.all });
    },
    onError: () => {
      toast.error('Failed to update fee structure');
    },
  });
}

export function useDeleteFeeStructure() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feeStructureId: string) =>
      deleteFeeStructure(schoolId!, feeStructureId),
    onSuccess: () => {
      toast.success('Fee structure deleted');
      queryClient.invalidateQueries({ queryKey: feesKeys.all });
    },
    onError: () => {
      toast.error('Failed to delete fee structure');
    },
  });
}

export function useGenerateInvoices() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateInvoicesRequest) =>
      generateInvoices(schoolId!, data),
    onSuccess: () => {
      toast.success('Invoices generated successfully');
      queryClient.invalidateQueries({ queryKey: feesKeys.all });
    },
    onError: () => {
      toast.error('Failed to generate invoices');
    },
  });
}

export function useRecordPayment() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      data,
    }: {
      invoiceId: string;
      data: RecordPaymentRequest;
    }) => recordPayment(schoolId!, invoiceId, data),
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      queryClient.invalidateQueries({ queryKey: feesKeys.all });
    },
    onError: () => {
      toast.error('Failed to record payment');
    },
  });
}
