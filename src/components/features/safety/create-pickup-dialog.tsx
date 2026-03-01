'use client';

import { useEffect, useState } from 'react';
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
import { getStudents, type StudentListParams } from '@/lib/api/students';
import { useCreatePickupLog } from '@/lib/hooks/use-safety';

const pickupFormSchema = z.object({
  studentId: z.string().min(1, { message: 'Please select a student' }),
  pickupPersonName: z.string().min(1, { message: 'Pickup person name is required' }),
  relationship: z.string().min(1, { message: 'Please select a relationship' }),
});

type PickupFormValues = z.infer<typeof pickupFormSchema>;

interface CreatePickupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePickupDialog({
  open,
  onOpenChange,
}: CreatePickupDialogProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const createPickupLog = useCreatePickupLog();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: studentsResponse } = useQuery({
    queryKey: ['students', schoolId, { search: searchQuery }],
    queryFn: () =>
      getStudents(schoolId!, {
        search: searchQuery || undefined,
        size: 20,
      } as StudentListParams),
    enabled: !!schoolId && open,
    select: (res) => res.data,
  });

  const students = studentsResponse ?? [];

  const form = useForm<PickupFormValues>({
    resolver: zodResolver(pickupFormSchema),
    defaultValues: {
      studentId: '',
      pickupPersonName: '',
      relationship: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setSearchQuery('');
    }
  }, [open, form]);

  function onSubmit(values: PickupFormValues) {
    createPickupLog.mutate(values, {
      onSuccess: () => {
        form.reset();
        setSearchQuery('');
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Pickup Log</DialogTitle>
          <DialogDescription>
            Record a student pickup event.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Student Search */}
            <div className="space-y-2">
              <FormLabel>Search Student</FormLabel>
              <Input
                placeholder="Search by name or admission number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Student Select */}
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
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} ({student.admissionNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pickup Person Name */}
            <FormField
              control={form.control}
              name="pickupPersonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Person Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. John Doe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Relationship */}
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Relative">Relative</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
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
              <Button type="submit" disabled={createPickupLog.isPending}>
                {createPickupLog.isPending ? 'Creating...' : 'Create Log'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
