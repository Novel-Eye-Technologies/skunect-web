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
import { getClasses, getSessions, getTerms } from '@/lib/api/school-settings';
import { useGenerateInvoices } from '@/lib/hooks/use-fees';

const generateInvoicesSchema = z.object({
  termId: z.string().min(1, { message: 'Please select a term' }),
  classId: z.string().optional(),
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

  const { data: sessionsResponse } = useQuery({
    queryKey: ['sessions', schoolId],
    queryFn: () => getSessions(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const currentSession = (sessionsResponse ?? []).find((s) => s.isCurrent);

  const { data: termsResponse } = useQuery({
    queryKey: ['terms', schoolId, currentSession?.id],
    queryFn: () => getTerms(schoolId!, currentSession!.id),
    enabled: !!schoolId && !!currentSession?.id,
    select: (res) => res.data,
  });

  const classes = classesResponse ?? [];
  const terms = termsResponse ?? [];

  const form = useForm<GenerateInvoicesFormValues>({
    resolver: zodResolver(generateInvoicesSchema),
    defaultValues: {
      termId: '',
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Invoices</DialogTitle>
          <DialogDescription>
            Generate invoices for all students in a class based on a fee
            structure.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Term */}
            <FormField
              control={form.control}
              name="termId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            {/* Class (optional) */}
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class (Optional)</FormLabel>
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
                          {cls.gradeLevel ? ` (${cls.gradeLevel})` : ''}
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
