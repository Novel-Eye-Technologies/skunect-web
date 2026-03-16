'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from '@/lib/hooks/use-school-settings';
import type { Subject } from '@/lib/types/school';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  description: z.string().optional().or(z.literal('')),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SubjectsManager() {
  const { data: subjects, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: '', code: '', description: '' },
  });

  function openCreate() {
    setEditingSubject(null);
    form.reset({ name: '', code: '', description: '' });
    setDialogOpen(true);
  }

  function openEdit(subject: Subject) {
    setEditingSubject(subject);
    form.reset({
      name: subject.name,
      code: subject.code,
      description: subject.description ?? '',
    });
    setDialogOpen(true);
  }

  function onSubmit(values: SubjectFormValues) {
    const payload = {
      name: values.name,
      code: values.code,
      description: values.description || undefined,
    };

    if (editingSubject) {
      updateSubject.mutate(
        { subjectId: editingSubject.id, data: payload },
        { onSuccess: () => setDialogOpen(false) },
      );
    } else {
      createSubject.mutate(payload, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  }

  function confirmDelete() {
    if (!deleteSubjectId) return;
    deleteSubject.mutate(deleteSubjectId, {
      onSuccess: () => setDeleteSubjectId(null),
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
            <CardTitle>Subjects</CardTitle>
            <CardDescription>
              Manage the subjects offered at your school.
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Add Subject
          </Button>
        </CardHeader>
        <CardContent>
          {!subjects || subjects.length === 0 ? (
            <EmptyState
              title="No subjects"
              description="Add subjects to your school curriculum."
              icon={BookOpen}
              action={
                <Button size="sm" onClick={openCreate}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Subject
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">
                      {subject.name}
                    </TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {subject.description ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Edit subject"
                          onClick={() => openEdit(subject)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          aria-label="Delete subject"
                          onClick={() => setDeleteSubjectId(subject.id)}
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
              {editingSubject ? 'Edit Subject' : 'Add Subject'}
            </DialogTitle>
            <DialogDescription>
              {editingSubject
                ? 'Update the subject details below.'
                : 'Fill in the details to add a new subject.'}
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
                      <FormLabel>Subject Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mathematics" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. MATH101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the subject"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    createSubject.isPending || updateSubject.isPending
                  }
                >
                  {(createSubject.isPending || updateSubject.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingSubject ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Confirmation ---- */}
      <ConfirmDialog
        open={!!deleteSubjectId}
        onOpenChange={(open) => !open && setDeleteSubjectId(null)}
        title="Delete Subject"
        description="Are you sure you want to delete this subject? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteSubject.isPending}
      />
    </>
  );
}
