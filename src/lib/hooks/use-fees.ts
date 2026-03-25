'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';
import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  getInvoices,
  generateInvoices,
  type InvoiceListParams,
} from '@/lib/api/fees';
import type {
  CreateFeeStructureRequest,
  UpdateFeeStructureRequest,
} from '@/lib/types/fees';
import type { PaginatedParams } from '@/lib/api/types';
import { queryClient } from '@/lib/query-client';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const feesKeys = {
  all: ['fees'] as const,
  structures: (schoolId: string, params?: PaginatedParams) =>
    [...feesKeys.all, 'structures', schoolId, params] as const,
  invoices: (schoolId: string, params?: InvoiceListParams) =>
    [...feesKeys.all, 'invoices', schoolId, params] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useFeeStructures(params?: PaginatedParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: feesKeys.structures(schoolId ?? '', params),
    queryFn: () => getFeeStructures(schoolId!, params),
    enabled: !!schoolId,
  });
}

export function useInvoices(params?: InvoiceListParams) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  return useQuery({
    queryKey: feesKeys.invoices(schoolId ?? '', params),
    queryFn: () => getInvoices(schoolId!, params),
    enabled: !!schoolId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateFeeStructure() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: (data: CreateFeeStructureRequest) =>
      createFeeStructure(schoolId!, data),
    onSuccess: () => {
      toast.success('Fee structure created');
      queryClient.invalidateQueries({ queryKey: feesKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create fee structure'));
    },
  });
}

export function useUpdateFeeStructure() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
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
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update fee structure'));
    },
  });
}

export function useGenerateInvoices() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  return useMutation({
    mutationFn: ({ termId, classId }: { termId: string; classId?: string }) =>
      generateInvoices(schoolId!, termId, classId),
    onSuccess: () => {
      toast.success('Invoices generated successfully');
      queryClient.invalidateQueries({ queryKey: feesKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to generate invoices'));
    },
  });
}
