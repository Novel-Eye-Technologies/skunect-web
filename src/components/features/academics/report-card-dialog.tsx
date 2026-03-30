'use client';

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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getClasses, getTerms } from '@/lib/api/school-settings';
import { useSchoolSettings } from '@/lib/hooks/use-school-settings';
import { useGenerateReportCards } from '@/lib/hooks/use-academics';

const generateReportCardsSchema = z.object({
  classId: z.string().min(1, 'Please select a class'),
  termId: z.string().min(1, 'Please select a term'),
});

type GenerateFormValues = z.infer<typeof generateReportCardsSchema>;

interface ReportCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportCardDialog({
  open,
  onOpenChange,
}: ReportCardDialogProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const generateReportCards = useGenerateReportCards();

  // Load school settings to get current session
  const { data: settings } = useSchoolSettings();
  const currentSessionId = settings?.currentSessionId ?? '';

  // Load classes
  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  // Load terms for the current session
  const { data: termsResponse } = useQuery({
    queryKey: ['terms', schoolId, currentSessionId],
    queryFn: () => getTerms(schoolId!, currentSessionId),
    enabled: !!schoolId && !!currentSessionId,
    select: (res) => res.data,
  });

  const classes = classesResponse ?? [];
  const terms = termsResponse ?? [];

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateReportCardsSchema),
    defaultValues: {
      classId: '',
      termId: '',
    },
  });

  function onSubmit(values: GenerateFormValues) {
    generateReportCards.mutate(values, {
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
          <DialogTitle>Generate Report Cards</DialogTitle>
          <DialogDescription>
            Select a class and term to generate report cards for all students.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Report cards will be generated based on all assessment scores
            entered for the selected class and term. Make sure all scores have
            been entered before generating.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          {cls.gradeLevel ? ` (${cls.gradeLevel})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={generateReportCards.isPending}>
                {generateReportCards.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate Report Cards
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
