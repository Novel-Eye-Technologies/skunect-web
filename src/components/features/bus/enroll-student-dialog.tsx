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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEnrollStudent, useBuses } from '@/lib/hooks/use-bus';
import { useStudents } from '@/lib/hooks/use-students';

const enrollFormSchema = z.object({
  busId: z.string().min(1, { message: 'Please select a bus' }),
  studentId: z.string().min(1, { message: 'Please select a student' }),
  pickupPoint: z.string().optional(),
});

type EnrollFormValues = z.infer<typeof enrollFormSchema>;

interface EnrollStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnrollStudentDialog({
  open,
  onOpenChange,
}: EnrollStudentDialogProps) {
  const enrollStudent = useEnrollStudent();
  const { data: busesResponse } = useBuses();
  const { data: studentsResponse } = useStudents();

  const buses = busesResponse?.data ?? [];
  const students = studentsResponse?.data ?? [];

  const form = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollFormSchema),
    defaultValues: {
      busId: '',
      studentId: '',
      pickupPoint: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  function onSubmit(values: EnrollFormValues) {
    enrollStudent.mutate(
      {
        busId: values.busId,
        studentId: values.studentId,
        pickupPoint: values.pickupPoint || undefined,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enroll Student on Bus</DialogTitle>
          <DialogDescription>
            Assign a student to a school bus with an optional pickup point.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Bus */}
            <FormField
              control={form.control}
              name="busId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bus</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {buses.map((bus) => (
                        <SelectItem key={bus.id} value={bus.id}>
                          {bus.plateNumber} — {bus.driverName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student */}
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pickup Point */}
            <FormField
              control={form.control}
              name="pickupPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Point (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Lekki Phase 1 Bus Stop"
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
              <Button type="submit" disabled={enrollStudent.isPending}>
                {enrollStudent.isPending ? 'Enrolling...' : 'Enroll Student'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
