'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Pencil, Trash2, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  useSessions,
} from '@/lib/hooks/use-school-settings';
import { useTeachers } from '@/lib/hooks/use-teachers';
import type { SchoolClass } from '@/lib/types/school';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  section: z.string().optional().or(z.literal('')),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  classTeacherId: z.string().min(1, 'Class teacher is required'),
});

type ClassFormValues = z.infer<typeof classSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ClassesManager() {
  const { data: classes, isLoading } = useClasses();
  const { data: sessions } = useSessions();
  const { data: teachersResponse } = useTeachers({ size: 200 });
  const teachers = teachersResponse?.data ?? [];
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();

  // Find the current session to associate classes with
  const currentSessionId = sessions?.find((s) => s.isCurrent)?.id ?? sessions?.[0]?.id;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      section: '',
      capacity: 30,
      classTeacherId: '',
    },
  });

  function openCreate() {
    setEditingClass(null);
    form.reset({ name: '', section: '', capacity: 30, classTeacherId: '' });
    setDialogOpen(true);
  }

  function openEdit(cls: SchoolClass) {
    setEditingClass(cls);
    form.reset({
      name: cls.name,
      section: cls.section ?? '',
      capacity: cls.capacity,
      classTeacherId: cls.classTeacherId ?? '',
    });
    setDialogOpen(true);
  }

  function onSubmit(values: ClassFormValues) {
    const payload = {
      name: values.name,
      capacity: values.capacity,
      section: values.section || undefined,
      classTeacherId: values.classTeacherId,
      sessionId: currentSessionId,
    };

    if (editingClass) {
      updateClass.mutate(
        { classId: editingClass.id, data: payload },
        { onSuccess: () => setDialogOpen(false) },
      );
    } else {
      createClass.mutate(payload, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  }

  function confirmDelete() {
    if (!deleteClassId) return;
    deleteClass.mutate(deleteClassId, {
      onSuccess: () => setDeleteClassId(null),
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Classes</CardTitle>
            <CardDescription>
              Manage your school&apos;s classes and their capacity.
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Add Class
          </Button>
        </CardHeader>
        <CardContent>
          {!classes || classes.length === 0 ? (
            <EmptyState
              title="No classes"
              description="Create your first class to start organizing students."
              icon={School}
              action={
                <Button size="sm" onClick={openCreate}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Class
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.section ?? '—'}</TableCell>
                    <TableCell>{cls.capacity}</TableCell>
                    <TableCell>
                      {cls.classTeacherName ?? '—'}
                    </TableCell>
                    <TableCell>{cls.studentCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(cls)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteClassId(cls.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ---- Add/Edit Dialog ---- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingClass ? 'Edit Class' : 'Add Class'}
            </DialogTitle>
            <DialogDescription>
              {editingClass
                ? 'Update the class details below.'
                : 'Fill in the details to create a new class.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. JSS 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="30"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.valueAsNumber || 0
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classTeacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Teacher</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.firstName} {teacher.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createClass.isPending ||
                    updateClass.isPending ||
                    (!editingClass && !currentSessionId)
                  }
                >
                  {(createClass.isPending || updateClass.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingClass ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Confirmation ---- */}
      <ConfirmDialog
        open={!!deleteClassId}
        onOpenChange={(open) => !open && setDeleteClassId(null)}
        title="Delete Class"
        description="Are you sure you want to delete this class? Students in this class will need to be reassigned. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteClass.isPending}
      />
    </>
  );
}
