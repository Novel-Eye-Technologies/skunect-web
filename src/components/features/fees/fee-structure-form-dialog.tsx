'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getClasses, getSessions, getTerms } from '@/lib/api/school-settings';
import {
  useCreateFeeStructure,
  useUpdateFeeStructure,
} from '@/lib/hooks/use-fees';
import type { FeeStructure } from '@/lib/types/fees';

const feeStructureFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  amount: z.number().min(1, { message: 'Amount must be at least 1' }),
  classId: z.string().optional(),
  termId: z.string().optional(),
  isMandatory: z.boolean().optional(),
  deadline: z.string().optional(),
  breakdown: z.string().optional(),
});

type FeeStructureFormValues = z.infer<typeof feeStructureFormSchema>;

interface FeeStructureFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeStructure?: FeeStructure;
}

export function FeeStructureFormDialog({
  open,
  onOpenChange,
  feeStructure,
}: FeeStructureFormDialogProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const isEdit = !!feeStructure;

  const createFeeStructure = useCreateFeeStructure();
  const updateFeeStructure = useUpdateFeeStructure();

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const { data: sessionsResponse } = useQuery({
    queryKey: ['sessions', schoolId],
    queryFn: () => getSessions(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const classes = classesResponse ?? [];
  const sessions = sessionsResponse ?? [];

  const form = useForm<FeeStructureFormValues>({
    resolver: zodResolver(feeStructureFormSchema),
    defaultValues: {
      name: '',
      amount: 0,
      classId: '',
      termId: '',
      isMandatory: false,
      deadline: '',
      breakdown: '',
    },
  });

  // Load terms for all sessions (use first session as default)
  const currentSessionId = sessions?.find((s) => s.isCurrent)?.id ?? sessions?.[0]?.id;

  const { data: termsResponse } = useQuery({
    queryKey: ['terms', schoolId, currentSessionId],
    queryFn: () => getTerms(schoolId!, currentSessionId!),
    enabled: !!schoolId && !!currentSessionId,
    select: (res) => res.data,
  });

  const terms = termsResponse ?? [];

  // Pre-fill form when editing
  useEffect(() => {
    if (feeStructure && open) {
      form.reset({
        name: feeStructure.name,
        amount: feeStructure.amount,
        classId: feeStructure.classId ?? '',
        termId: feeStructure.termId ?? '',
        isMandatory: feeStructure.isMandatory ?? false,
        deadline: feeStructure.deadline ?? '',
        breakdown: feeStructure.breakdown ?? '',
      });
    } else if (!open) {
      form.reset({
        name: '',
        amount: 0,
        classId: '',
        termId: '',
        isMandatory: false,
        deadline: '',
        breakdown: '',
      });
    }
  }, [feeStructure, open, form]);

  function onSubmit(values: FeeStructureFormValues) {
    // Clean up empty strings to undefined
    const payload = {
      name: values.name,
      amount: values.amount,
      classId: values.classId || undefined,
      termId: values.termId || undefined,
      isMandatory: values.isMandatory,
      deadline: values.deadline || undefined,
      breakdown: values.breakdown || undefined,
    };

    if (isEdit) {
      updateFeeStructure.mutate(
        { feeStructureId: feeStructure.id, data: payload },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        },
      );
    } else {
      createFeeStructure.mutate(payload, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    }
  }

  const isPending = createFeeStructure.isPending || updateFeeStructure.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Fee Structure' : 'Create Fee Structure'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the fee structure details below.'
              : 'Fill in the details to create a new fee structure.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Tuition Fee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₦)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class */}
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'NONE' ? '' : value)
                    }
                    value={field.value || 'NONE'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All Classes" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                          {cls.section ? ` (${cls.section})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Term */}
            <FormField
              control={form.control}
              name="termId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'NONE' ? '' : value)
                    }
                    value={field.value || 'NONE'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All Terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">All Terms</SelectItem>
                      {terms.map((term) => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deadline */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Breakdown */}
            <FormField
              control={form.control}
              name="breakdown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breakdown (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Fee breakdown details..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'Saving...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Structure'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
