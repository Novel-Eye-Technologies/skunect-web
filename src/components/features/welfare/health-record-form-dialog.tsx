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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateHealthRecord,
  useUpdateHealthRecord,
} from '@/lib/hooks/use-health-records';
import { useStudents } from '@/lib/hooks/use-students';
import { RECORD_TYPES, SEVERITY_OPTIONS } from '@/lib/types/health-record';
import type { HealthRecord } from '@/lib/types/health-record';

const recordTypeLabels: Record<string, string> = {
  ALLERGY: 'Allergy',
  CONDITION: 'Condition',
  MEDICATION: 'Medication',
  VACCINATION: 'Vaccination',
  INCIDENT: 'Incident',
  NOTE: 'Note',
};

const healthRecordSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  recordType: z.string().min(1, 'Please select a record type'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  severity: z.string().optional(),
  isActive: z.boolean().optional(),
});

type HealthRecordFormValues = z.infer<typeof healthRecordSchema>;

interface HealthRecordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog opens in edit mode and pre-fills the form. */
  record?: HealthRecord;
}

export function HealthRecordFormDialog({
  open,
  onOpenChange,
  record,
}: HealthRecordFormDialogProps) {
  const isEdit = !!record;
  const createRecord = useCreateHealthRecord();
  const updateRecord = useUpdateHealthRecord();
  const isPending = isEdit ? updateRecord.isPending : createRecord.isPending;

  const form = useForm<HealthRecordFormValues>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: {
      studentId: '',
      recordType: '',
      title: '',
      description: '',
      severity: '',
      isActive: true,
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (record && open) {
      form.reset({
        studentId: record.studentId ?? '',
        recordType: record.recordType ?? '',
        title: record.title ?? '',
        description: record.description ?? '',
        severity: record.severity ?? '',
        isActive: record.isActive !== false,
      });
    } else if (!record && open) {
      form.reset({
        studentId: '',
        recordType: '',
        title: '',
        description: '',
        severity: '',
        isActive: true,
      });
    }
  }, [record, open, form]);

  const { data: studentsRes } = useStudents({ size: 100 });
  const students = studentsRes?.data ?? [];

  function onSubmit(values: HealthRecordFormValues) {
    if (isEdit) {
      updateRecord.mutate(
        {
          recordId: record.id,
          data: {
            recordType: values.recordType,
            title: values.title,
            description: values.description || undefined,
            severity: values.severity || undefined,
            isActive: values.isActive,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        },
      );
    } else {
      createRecord.mutate(
        {
          studentId: values.studentId,
          recordType: values.recordType,
          title: values.title,
          description: values.description || undefined,
          severity: values.severity || undefined,
        },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Health Record' : 'Add Health Record'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the health record details below.'
              : 'Record a student\u0027s health information, allergy, or medical note.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName}
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
              name="recordType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Record Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RECORD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {recordTypeLabels[type] ?? type}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Peanut Allergy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map((sev) => (
                        <SelectItem key={sev} value={sev}>
                          {sev}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-base">Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Mark this record as active or resolved.
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Record'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
