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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getClasses } from '@/lib/api/school-settings';
import { getFeeStructures } from '@/lib/api/fees';
import { useGenerateInvoices } from '@/lib/hooks/use-fees';

const generateInvoicesSchema = z.object({
  feeStructureId: z.string().min(1, { message: 'Please select a fee structure' }),
  classId: z.string().min(1, { message: 'Please select a class' }),
});

type GenerateInvoicesFormValues = z.infer<typeof generateInvoicesSchema>;

interface GenerateInvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateInvoicesDialog({
  open,
  onOpenChange,
}: GenerateInvoicesDialogProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const generateInvoices = useGenerateInvoices();

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const { data: feeStructuresResponse } = useQuery({
    queryKey: ['fee-structures-select', schoolId],
    queryFn: () => getFeeStructures(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const classes = classesResponse ?? [];
  const feeStructures = (feeStructuresResponse ?? []).filter((fs) => fs.isActive);

  const form = useForm<GenerateInvoicesFormValues>({
    resolver: zodResolver(generateInvoicesSchema),
    defaultValues: {
      feeStructureId: '',
      classId: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  function onSubmit(values: GenerateInvoicesFormValues) {
    generateInvoices.mutate(values, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Generate Invoices</DialogTitle>
          <DialogDescription>
            Generate invoices for all students in a class based on a fee
            structure.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Fee Structure */}
            <FormField
              control={form.control}
              name="feeStructureId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Structure</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee structure" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feeStructures.map((fs) => (
                        <SelectItem key={fs.id} value={fs.id}>
                          {fs.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={generateInvoices.isPending}>
                {generateInvoices.isPending
                  ? 'Generating...'
                  : 'Generate Invoices'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
