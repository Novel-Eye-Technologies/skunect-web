'use client';

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
import { useCreateMoodEntry } from '@/lib/hooks/use-mood';
import { useStudents } from '@/lib/hooks/use-students';
import { MOOD_OPTIONS } from '@/lib/types/mood';

const moodEmojis: Record<string, string> = {
  HAPPY: '\uD83D\uDE0A',
  SAD: '\uD83D\uDE22',
  ANGRY: '\uD83D\uDE21',
  ANXIOUS: '\uD83D\uDE1F',
  NEUTRAL: '\uD83D\uDE10',
  EXCITED: '\uD83E\uDD29',
};

const moodSchema = z.object({
  studentId: z.string().min(1, 'Please select a student'),
  mood: z.string().min(1, 'Please select a mood'),
  note: z.string().optional(),
});

type MoodFormValues = z.infer<typeof moodSchema>;

interface MoodFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MoodFormDialog({ open, onOpenChange }: MoodFormDialogProps) {
  const createMood = useCreateMoodEntry();

  const form = useForm<MoodFormValues>({
    resolver: zodResolver(moodSchema),
    defaultValues: {
      studentId: '',
      mood: '',
      note: '',
    },
  });

  const { data: studentsRes } = useStudents({ size: 100 });
  const students = studentsRes?.data ?? [];

  function onSubmit(values: MoodFormValues) {
    createMood.mutate(
      {
        studentId: values.studentId,
        mood: values.mood,
        note: values.note || undefined,
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
          <DialogTitle>Log Mood Entry</DialogTitle>
          <DialogDescription>
            Record a student&apos;s current emotional state.
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mood</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOOD_OPTIONS.map((mood) => (
                        <SelectItem key={mood} value={mood}>
                          {moodEmojis[mood]} {mood.charAt(0) + mood.slice(1).toLowerCase()}
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional observations..."
                      rows={3}
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
              <Button type="submit" disabled={createMood.isPending}>
                {createMood.isPending ? 'Saving...' : 'Log Mood'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
