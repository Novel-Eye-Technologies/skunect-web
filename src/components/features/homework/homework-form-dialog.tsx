'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { FileText, Upload, X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getClasses, getSubjects } from '@/lib/api/school-settings';
import {
  useCreateHomework,
  useUpdateHomework,
} from '@/lib/hooks/use-homework';
import { useMySubjects } from '@/lib/hooks/use-school-settings';
import type { HomeworkListItem, HomeworkDetail } from '@/lib/types/homework';

const homeworkFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  classId: z.string().min(1, 'Please select a class'),
  subjectId: z.string().min(1, 'Please select a subject'),
  assignedDate: z.string().min(1, 'Assigned date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  maxScore: z.number().min(1, 'Max score must be at least 1'),
});

type HomeworkFormValues = z.infer<typeof homeworkFormSchema>;

interface HomeworkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homework?: HomeworkListItem | HomeworkDetail;
}

export function HomeworkFormDialog({
  open,
  onOpenChange,
  homework,
}: HomeworkFormDialogProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const currentRole = useAuthStore((s) => s.currentRole);
  const isEdit = !!homework;
  const isTeacher = currentRole === 'TEACHER';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const createHomework = useCreateHomework();
  const updateHomework = useUpdateHomework();

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: () => getSubjects(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  // Load teacher's assigned subjects (only for TEACHER role)
  const { data: mySubjects } = useMySubjects();

  const allClasses = classesResponse ?? [];
  const allSubjects = subjectsResponse ?? [];

  const form = useForm<HomeworkFormValues>({
    resolver: zodResolver(homeworkFormSchema),
    defaultValues: {
      title: '',
      description: '',
      classId: '',
      subjectId: '',
      assignedDate: '',
      dueDate: '',
      maxScore: 100,
    },
  });

  // Filter classes and subjects for teachers based on their assignments
  const selectedClassId = form.watch('classId');
  const classes = isTeacher && mySubjects
    ? allClasses.filter((cls) =>
        mySubjects.some((ms) => ms.classId === cls.id),
      )
    : allClasses;

  const subjects = isTeacher && mySubjects
    ? allSubjects.filter((sub) =>
        mySubjects.some(
          (ms) =>
            ms.subjectId === sub.id &&
            (!selectedClassId || ms.classId === selectedClassId),
        ),
      )
    : allSubjects;

  // Pre-fill form when editing
  useEffect(() => {
    if (homework && open) {
      form.reset({
        title: homework.title,
        description: 'description' in homework ? homework.description : '',
        classId: homework.classId,
        subjectId: homework.subjectId,
        assignedDate: homework.assignedDate,
        dueDate: homework.dueDate,
        maxScore: 'maxScore' in homework ? homework.maxScore : 100,
      });
      setFiles([]);
    } else if (!open) {
      form.reset();
      setFiles([]);
    }
  }, [homework, open, form]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit(values: HomeworkFormValues) {
    if (isEdit) {
      updateHomework.mutate(
        { homeworkId: homework.id, data: values },
        {
          onSuccess: () => {
            form.reset();
            setFiles([]);
            onOpenChange(false);
          },
        },
      );
    } else {
      createHomework.mutate(
        { data: values, files: files.length > 0 ? files : undefined },
        {
          onSuccess: () => {
            form.reset();
            setFiles([]);
            onOpenChange(false);
          },
        },
      );
    }
  }

  const isPending = createHomework.isPending || updateHomework.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Assignment' : 'Create Assignment'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the assignment details below.'
              : 'Fill in the details to create a new homework assignment.'}
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
                    <Input placeholder="e.g. Chapter 5 Questions" {...field} />
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

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assignedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Max Score */}
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the assignment..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Attachments (create mode only) */}
            {!isEdit && (
              <div className="space-y-2">
                <FormLabel>Attachments (Optional)</FormLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add Files
                </Button>

                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                    : 'Create Assignment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
