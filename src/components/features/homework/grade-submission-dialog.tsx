'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/status-badge';
import { useGradeSubmission } from '@/lib/hooks/use-homework';
import { formatDateTime } from '@/lib/utils/format-date';
import type { Submission } from '@/lib/types/homework';

interface GradeSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission?: Submission;
  homeworkId: string;
  maxScore: number;
}

export function GradeSubmissionDialog({
  open,
  onOpenChange,
  submission,
  homeworkId,
  maxScore,
}: GradeSubmissionDialogProps) {
  const gradeSubmission = useGradeSubmission();

  const gradeFormSchema = z.object({
    score: z
      .number()
      .min(0, 'Score must be at least 0')
      .max(maxScore, `Score must not exceed ${maxScore}`),
    feedback: z.string().optional(),
  });

  type GradeFormValues = z.infer<typeof gradeFormSchema>;

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      score: 0,
      feedback: '',
    },
  });

  // Pre-fill when opening with existing grade
  useEffect(() => {
    if (submission && open) {
      form.reset({
        score: submission.score ?? 0,
        feedback: submission.feedback ?? '',
      });
    } else if (!open) {
      form.reset();
    }
  }, [submission, open, form]);

  function onSubmit(values: GradeFormValues) {
    if (!submission) return;
    gradeSubmission.mutate(
      {
        homeworkId,
        submissionId: submission.studentId,
        data: {
          score: values.score,
          feedback: values.feedback || undefined,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
          <DialogDescription>
            Enter a score and optional feedback for this submission.
          </DialogDescription>
        </DialogHeader>

        {submission && (
          <div className="space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {submission.studentName}
              </span>
              <StatusBadge status={submission.status} />
            </div>
            <div className="text-xs text-muted-foreground">
              Submitted: {formatDateTime(submission.submittedAt ?? '')}
            </div>
          </div>
        )}

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Score (0 - {maxScore})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={maxScore}
                      placeholder="Enter score"
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

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter feedback for the student..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={gradeSubmission.isPending}>
                {gradeSubmission.isPending ? 'Saving...' : 'Submit Grade'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
