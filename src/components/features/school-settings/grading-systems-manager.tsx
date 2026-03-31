'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  GraduationCap,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import {
  useGradingSystems,
  useCreateGradingSystem,
  useUpdateGradingSystem,
  useDeleteGradingSystem,
} from '@/lib/hooks/use-school-settings';
import type { GradingSystem } from '@/lib/types/school';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const gradeDefinitionSchema = z.object({
  gradeLabel: z.string().min(1, 'Grade letter is required'),
  minScore: z.number().min(0, 'Min score must be >= 0'),
  maxScore: z.number().min(1, 'Max score must be >= 1'),
  remark: z.string().min(1, 'Remark is required'),
});

const gradingSystemSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  scales: z
    .array(gradeDefinitionSchema)
    .min(1, 'At least one grade definition is required'),
  isDefault: z.boolean().optional(),
});

type GradingSystemFormValues = z.infer<typeof gradingSystemSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GradingSystemsManager() {
  const { data: gradingSystems, isLoading } = useGradingSystems();
  const createGradingSystem = useCreateGradingSystem();
  const updateGradingSystem = useUpdateGradingSystem();
  const deleteGradingSystem = useDeleteGradingSystem();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<GradingSystem | null>(
    null,
  );
  const [deleteSystemId, setDeleteSystemId] = useState<string | null>(null);

  const form = useForm<GradingSystemFormValues>({
    resolver: zodResolver(gradingSystemSchema),
    defaultValues: {
      name: '',
      scales: [{ gradeLabel: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' }],
      isDefault: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'scales',
  });

  function openCreate() {
    setEditingSystem(null);
    form.reset({
      name: '',
      scales: [
        { gradeLabel: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
      ],
      isDefault: false,
    });
    setDialogOpen(true);
  }

  function openEdit(system: GradingSystem) {
    setEditingSystem(system);
    form.reset({
      name: system.name,
      scales: (system.scales ?? []).map((g) => ({
        gradeLabel: g.gradeLabel,
        minScore: g.minScore,
        maxScore: g.maxScore,
        remark: g.remark ?? undefined,
      })),
      isDefault: system.isDefault,
    });
    setDialogOpen(true);
  }

  function onSubmit(values: GradingSystemFormValues) {
    const payload = {
      name: values.name,
      scales: values.scales,
      isDefault: values.isDefault,
    };

    if (editingSystem) {
      updateGradingSystem.mutate(
        { id: editingSystem.id, data: payload },
        { onSuccess: () => setDialogOpen(false) },
      );
    } else {
      createGradingSystem.mutate(payload, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  }

  function handleSetDefault(system: GradingSystem) {
    updateGradingSystem.mutate({
      id: system.id,
      data: {
        name: system.name,
        scales: (system.scales ?? []).map(({ gradeLabel, minScore, maxScore, remark }) => ({ gradeLabel, minScore, maxScore, remark })),
        isDefault: true,
      },
    });
  }

  function confirmDelete() {
    if (!deleteSystemId) return;
    deleteGradingSystem.mutate(deleteSystemId, {
      onSuccess: () => setDeleteSystemId(null),
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Grading Systems</h3>
            <p className="text-sm text-muted-foreground">
              Define grading scales used for student assessments.
            </p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Add Grading System
          </Button>
        </div>

        {!gradingSystems || gradingSystems.length === 0 ? (
          <EmptyState
            title="No grading systems"
            description="Create a grading system to define how student scores are graded."
            icon={GraduationCap}
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1 h-4 w-4" />
                Add Grading System
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gradingSystems.map((system) => (
              <Card key={system.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{system.name}</CardTitle>
                    {system.isDefault && (
                      <Badge variant="default" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!system.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Set as default"
                        title="Set as default"
                        onClick={() => handleSetDefault(system)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Edit grading system"
                      onClick={() => openEdit(system)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      aria-label="Delete grading system"
                      onClick={() => setDeleteSystemId(system.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {(system.scales ?? []).map((g, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm"
                      >
                        <span className="font-medium">{g.gradeLabel}</span>
                        <span className="text-muted-foreground">
                          {g.minScore}–{g.maxScore}
                        </span>
                        <span className="text-muted-foreground">
                          {g.remark}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ---- Add/Edit Dialog ---- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSystem ? 'Edit Grading System' : 'Add Grading System'}
            </DialogTitle>
            <DialogDescription>
              {editingSystem
                ? 'Update the grading system and its grade definitions.'
                : 'Define a grading system with grade ranges.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Standard Grading"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Grade Definitions</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        gradeLabel: '',
                        minScore: 0,
                        maxScore: 0,
                        remark: '',
                      })
                    }
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add Grade
                  </Button>
                </div>

                {form.formState.errors.scales?.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.scales.root.message}
                  </p>
                )}

                <div className="space-y-2">
                  {/* Column headers */}
                  <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr_auto] gap-2 px-1 text-xs font-medium text-muted-foreground">
                    <span>Grade</span>
                    <span>Min Score</span>
                    <span>Max Score</span>
                    <span>Remark</span>
                    <span className="w-8" />
                  </div>

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr_1fr_1fr_1.5fr_auto] items-start gap-2"
                    >
                      <FormField
                        control={form.control}
                        name={`scales.${index}.gradeLabel`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="A" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`scales.${index}.minScore`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                placeholder="70"
                                {...field}
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
                        name={`scales.${index}.maxScore`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                placeholder="100"
                                {...field}
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
                        name={`scales.${index}.remark`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Excellent"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-8 text-muted-foreground hover:text-destructive"
                        aria-label="Remove grade level"
                        disabled={fields.length <= 1}
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
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
                    createGradingSystem.isPending ||
                    updateGradingSystem.isPending
                  }
                >
                  {(createGradingSystem.isPending ||
                    updateGradingSystem.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingSystem ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Confirmation ---- */}
      <ConfirmDialog
        open={!!deleteSystemId}
        onOpenChange={(open) => !open && setDeleteSystemId(null)}
        title="Delete Grading System"
        description="Are you sure you want to delete this grading system? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteGradingSystem.isPending}
      />
    </>
  );
}
