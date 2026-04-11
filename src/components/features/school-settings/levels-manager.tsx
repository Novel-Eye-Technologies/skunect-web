'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Pencil, Trash2, Layers, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  useLevels,
  useCreateLevel,
  useUpdateLevel,
  useDeleteLevel,
  useMoveClassesBetweenLevels,
} from '@/lib/hooks/use-levels';
import { useClasses } from '@/lib/hooks/use-school-settings';
import type { Level } from '@/lib/types/levels';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const levelSchema = z.object({
  name: z.string().min(1, 'Level name is required').max(100),
  ordinal: z.number().int().min(0).optional(),
});

type LevelFormValues = z.infer<typeof levelSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LevelsManager() {
  const { data: levels, isLoading } = useLevels();
  const { data: classes } = useClasses();
  const createLevel = useCreateLevel();
  const updateLevel = useUpdateLevel();
  const deleteLevel = useDeleteLevel();
  const moveClasses = useMoveClassesBetweenLevels();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [deleteLevelTarget, setDeleteLevelTarget] = useState<Level | null>(null);
  const [moveLevelTarget, setMoveLevelTarget] = useState<Level | null>(null);

  const form = useForm<LevelFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: { name: '', ordinal: undefined },
  });

  function openCreate() {
    setEditingLevel(null);
    form.reset({ name: '', ordinal: undefined });
    setDialogOpen(true);
  }

  function openEdit(level: Level) {
    setEditingLevel(level);
    form.reset({ name: level.name, ordinal: level.ordinal });
    setDialogOpen(true);
  }

  function onSubmit(values: LevelFormValues) {
    const payload = { name: values.name, ordinal: values.ordinal };
    if (editingLevel) {
      updateLevel.mutate(
        { levelId: editingLevel.id, data: payload },
        { onSuccess: () => setDialogOpen(false) },
      );
    } else {
      createLevel.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  }

  function confirmDelete() {
    if (!deleteLevelTarget) return;
    deleteLevel.mutate(deleteLevelTarget.id, {
      onSuccess: () => setDeleteLevelTarget(null),
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
            <CardTitle>Levels</CardTitle>
            <CardDescription>
              Group classes by grade level (e.g. JSS 1 contains JSS 1A and JSS 1B).
              Levels are used to assign fees to multiple classes at once.
            </CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Add Level
          </Button>
        </CardHeader>
        <CardContent>
          {!levels || levels.length === 0 ? (
            <EmptyState
              title="No levels"
              description="Create your first level to start grouping classes."
              icon={Layers}
              action={
                <Button size="sm" onClick={openCreate}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Level
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell className="font-medium">{level.name}</TableCell>
                    <TableCell>{level.ordinal}</TableCell>
                    <TableCell>{level.classCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {level.classCount > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Move classes"
                            title="Move classes to another level"
                            onClick={() => setMoveLevelTarget(level)}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Edit level"
                          title="Edit level"
                          onClick={() => openEdit(level)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          aria-label="Delete level"
                          title={
                            level.classCount > 0
                              ? 'Move classes to another level first'
                              : 'Delete level'
                          }
                          onClick={() => setDeleteLevelTarget(level)}
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
              {editingLevel ? 'Edit Level' : 'Add Level'}
            </DialogTitle>
            <DialogDescription>
              {editingLevel
                ? 'Update the level details below.'
                : 'Levels group classes by grade. Leave Order blank to append after existing levels.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. JSS 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ordinal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Auto"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : e.target.valueAsNumber,
                          )
                        }
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
                  disabled={createLevel.isPending || updateLevel.isPending}
                >
                  {(createLevel.isPending || updateLevel.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingLevel ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ---- Delete Confirmation ---- */}
      <ConfirmDialog
        open={!!deleteLevelTarget}
        onOpenChange={(open) => !open && setDeleteLevelTarget(null)}
        title="Delete Level"
        description={
          deleteLevelTarget && deleteLevelTarget.classCount > 0
            ? `This level has ${deleteLevelTarget.classCount} class(es). Move them to another level first using the "Move classes" button. Attempting to delete will be rejected by the server.`
            : 'Are you sure you want to delete this level? This action cannot be undone.'
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteLevel.isPending}
      />

      {/* ---- Move Classes Dialog ---- */}
      {moveLevelTarget && (
        <MoveClassesDialog
          level={moveLevelTarget}
          allLevels={levels ?? []}
          allClasses={(classes ?? []).filter(
            (c) => c.levelId === moveLevelTarget.id,
          )}
          onClose={() => setMoveLevelTarget(null)}
          isPending={moveClasses.isPending}
          onSubmit={(targetLevelId, classIds) => {
            moveClasses.mutate(
              {
                sourceLevelId: moveLevelTarget.id,
                data: { targetLevelId, classIds },
              },
              { onSuccess: () => setMoveLevelTarget(null) },
            );
          }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Move Classes Dialog
// ---------------------------------------------------------------------------

interface MoveClassesDialogProps {
  level: Level;
  allLevels: Level[];
  allClasses: Array<{ id: string; name: string }>;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (targetLevelId: string, classIds: string[]) => void;
}

function MoveClassesDialog({
  level,
  allLevels,
  allClasses,
  isPending,
  onClose,
  onSubmit,
}: MoveClassesDialogProps) {
  const [targetLevelId, setTargetLevelId] = useState<string>('');
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(
    new Set(allClasses.map((c) => c.id)),
  );

  const targetLevels = useMemo(
    () => allLevels.filter((l) => l.id !== level.id),
    [allLevels, level.id],
  );

  function toggle(classId: string) {
    setSelectedClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  }

  function handleSubmit() {
    if (!targetLevelId || selectedClassIds.size === 0) return;
    onSubmit(targetLevelId, Array.from(selectedClassIds));
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Classes from &ldquo;{level.name}&rdquo;</DialogTitle>
          <DialogDescription>
            Select the classes to move and the destination level.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Target Level</Label>
            <Select value={targetLevelId} onValueChange={setTargetLevelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a destination level" />
              </SelectTrigger>
              <SelectContent>
                {targetLevels.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Classes ({selectedClassIds.size} selected)</Label>
            <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-3">
              {allClasses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No classes in this level.
                </p>
              ) : (
                allClasses.map((cls) => (
                  <label
                    key={cls.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={selectedClassIds.has(cls.id)}
                      onCheckedChange={() => toggle(cls.id)}
                    />
                    {cls.name}
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              isPending || !targetLevelId || selectedClassIds.size === 0
            }
            onClick={handleSubmit}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Move {selectedClassIds.size} Class
            {selectedClassIds.size === 1 ? '' : 'es'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
