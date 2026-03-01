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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getClasses, getSubjects, getTerms } from '@/lib/api/school-settings';
import {
  useCreateAssessment,
  useUpdateAssessment,
} from '@/lib/hooks/use-academics';
import { useSchoolSettings } from '@/lib/hooks/use-school-settings';
import type { Assessment } from '@/lib/types/academics';

const assessmentFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  classId: z.string().min(1, 'Please select a class'),
  subjectId: z.string().min(1, 'Please select a subject'),
  termId: z.string().min(1, 'Please select a term'),
  type: z.enum(['CA1', 'CA2', 'CA3', 'EXAM'], {
    message: 'Please select an assessment type',
  }),
  maxScore: z.number().min(1, 'Max score must be at least 1'),
  date: z.string().min(1, 'Date is required'),
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

interface AssessmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment?: Assessment;
}

export function AssessmentFormDialog({
  open,
  onOpenChange,
  assessment,
}: AssessmentFormDialogProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const isEdit = !!assessment;

  const createAssessment = useCreateAssessment();
  const updateAssessment = useUpdateAssessment();

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

  // Load subjects
  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: () => getSubjects(schoolId!),
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
  const subjects = subjectsResponse ?? [];
  const terms = termsResponse ?? [];

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      title: '',
      classId: '',
      subjectId: '',
      termId: '',
      type: undefined,
      maxScore: 100,
      date: '',
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (assessment && open) {
      form.reset({
        title: assessment.title,
        classId: assessment.classId,
        subjectId: assessment.subjectId,
        termId: assessment.termId,
        type: assessment.type,
        maxScore: assessment.maxScore,
        date: assessment.date,
      });
    } else if (!open) {
      form.reset({
        title: '',
        classId: '',
        subjectId: '',
        termId: '',
        type: undefined,
        maxScore: 100,
        date: '',
      });
    }
  }, [assessment, open, form]);

  function onSubmit(values: AssessmentFormValues) {
    if (isEdit) {
      updateAssessment.mutate(
        { assessmentId: assessment.id, data: values },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        },
      );
    } else {
      createAssessment.mutate(values, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    }
  }

  const isPending = createAssessment.isPending || updateAssessment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Assessment' : 'Create Assessment'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the assessment details below.'
              : 'Fill in the details to create a new assessment.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Mathematics CA1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class & Subject */}
            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Term & Type */}
            <div className="grid grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CA1">CA1</SelectItem>
                        <SelectItem value="CA2">CA2</SelectItem>
                        <SelectItem value="CA3">CA3</SelectItem>
                        <SelectItem value="EXAM">Exam</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Max Score & Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Score</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                    : 'Create Assessment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
