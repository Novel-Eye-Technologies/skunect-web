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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/status-badge';
import { useUpdateAttendanceRecord } from '@/lib/hooks/use-attendance';
import { formatDate } from '@/lib/utils/format-date';
import type { AttendanceRecord } from '@/lib/types/attendance';

const editAttendanceSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE'], {
    message: 'Please select a status',
  }),
  notes: z.string().optional(),
});

type EditAttendanceFormValues = z.infer<typeof editAttendanceSchema>;

interface EditAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AttendanceRecord | null;
}

export function EditAttendanceDialog({
  open,
  onOpenChange,
  record,
}: EditAttendanceDialogProps) {
  const updateAttendance = useUpdateAttendanceRecord();

  const form = useForm<EditAttendanceFormValues>({
    resolver: zodResolver(editAttendanceSchema),
    defaultValues: {
      status: undefined,
      notes: '',
    },
  });

  // Pre-fill when opening with existing record
  useEffect(() => {
    if (record && open) {
      form.reset({
        status: (record.status as 'PRESENT' | 'ABSENT' | 'LATE') ?? undefined,
        notes: record.notes ?? '',
      });
    } else if (!open) {
      form.reset({ status: undefined, notes: '' });
    }
  }, [record, open, form]);

  function onSubmit(values: EditAttendanceFormValues) {
    if (!record) return;
    updateAttendance.mutate(
      {
        recordId: record.id!,
        status: values.status,
        notes: values.notes || undefined,
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
          <DialogTitle>Edit Attendance Record</DialogTitle>
          <DialogDescription>
            Update the attendance status and notes for this record.
          </DialogDescription>
        </DialogHeader>

        {record && (
          <div className="space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {record.studentName}
              </span>
              <StatusBadge status={record.status ?? ''} />
            </div>
            <div className="text-xs text-muted-foreground">
              Date: {formatDate(record.date ?? '')}
            </div>
          </div>
        )}

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRESENT">Present</SelectItem>
                      <SelectItem value="ABSENT">Absent</SelectItem>
                      <SelectItem value="LATE">Late</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a note about this change..."
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
              <Button type="submit" disabled={updateAttendance.isPending}>
                {updateAttendance.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
