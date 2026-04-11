'use client';

import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getClasses, getSessions, getTerms } from '@/lib/api/school-settings';
import { useLevels } from '@/lib/hooks/use-levels';
import {
  useCreateFeeStructure,
  useUpdateFeeStructure,
} from '@/lib/hooks/use-fees';
import type { FeeStructure } from '@/lib/types/fees';
import type { Api } from '@/lib/api/schema';

type FeeTargetType = 'SCHOOL' | 'LEVEL' | 'CLASS';
type TargetDto = Api['FeeStructureTargetDto'];

// SCRUM-63: targets are validated server-side too — these client checks just give
// instant feedback. The radio decides the SHAPE: SCHOOL has no IDs; LEVEL/CLASS
// require at least one ID from the multi-select. Multi-select emptiness is checked
// in onSubmit (not in zod) to avoid input/output type mismatches between zod 4 and
// the react-hook-form resolver.
const feeStructureFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  amount: z.number().min(1, { message: 'Amount must be at least 1' }),
  termId: z.string().optional(),
  targetType: z.enum(['SCHOOL', 'LEVEL', 'CLASS']),
  selectedLevelIds: z.array(z.string()),
  selectedClassIds: z.array(z.string()),
  isMandatory: z.boolean().optional(),
  deadline: z.string().optional(),
  breakdown: z.string().optional(),
});

type FeeStructureFormValues = z.infer<typeof feeStructureFormSchema>;

interface FeeStructureFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeStructure?: FeeStructure;
}

export function FeeStructureFormDialog({
  open,
  onOpenChange,
  feeStructure,
}: FeeStructureFormDialogProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const isEdit = !!feeStructure;

  const createFeeStructure = useCreateFeeStructure();
  const updateFeeStructure = useUpdateFeeStructure();

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const { data: sessionsResponse } = useQuery({
    queryKey: ['sessions', schoolId],
    queryFn: () => getSessions(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const { data: levels } = useLevels();

  const classes = useMemo(() => classesResponse ?? [], [classesResponse]);
  const sessions = sessionsResponse ?? [];

  const form = useForm<FeeStructureFormValues>({
    resolver: zodResolver(feeStructureFormSchema),
    defaultValues: {
      name: '',
      amount: 0,
      termId: '',
      targetType: 'SCHOOL',
      selectedLevelIds: [],
      selectedClassIds: [],
      isMandatory: false,
      deadline: '',
      breakdown: '',
    },
  });

  // Load terms for the current session
  const currentSessionId =
    sessions?.find((s) => s.isCurrent)?.id ?? sessions?.[0]?.id;

  const { data: termsResponse } = useQuery({
    queryKey: ['terms', schoolId, currentSessionId],
    queryFn: () => getTerms(schoolId!, currentSessionId!),
    enabled: !!schoolId && !!currentSessionId,
    select: (res) => res.data,
  });

  const terms = termsResponse ?? [];

  // Pre-fill form when editing — derive radio + multi-select state from the
  // existing targets[]. SCHOOL → SCHOOL radio. All-LEVEL → LEVEL radio. All-CLASS → CLASS radio.
  useEffect(() => {
    if (feeStructure && open) {
      const t = feeStructure.targets ?? [];
      let targetType: FeeTargetType = 'SCHOOL';
      let selectedLevelIds: string[] = [];
      let selectedClassIds: string[] = [];

      if (t.some((x) => x.type === 'CLASS')) {
        targetType = 'CLASS';
        selectedClassIds = t
          .filter((x) => x.type === 'CLASS' && x.targetId)
          .map((x) => x.targetId as string);
      } else if (t.some((x) => x.type === 'LEVEL')) {
        targetType = 'LEVEL';
        selectedLevelIds = t
          .filter((x) => x.type === 'LEVEL' && x.targetId)
          .map((x) => x.targetId as string);
      }

      form.reset({
        name: feeStructure.name,
        amount: feeStructure.amount,
        termId: feeStructure.termId ?? '',
        targetType,
        selectedLevelIds,
        selectedClassIds,
        isMandatory: feeStructure.isMandatory ?? false,
        deadline: feeStructure.deadline ?? '',
        breakdown: feeStructure.breakdown ?? '',
      });
    } else if (!open) {
      form.reset({
        name: '',
        amount: 0,
        termId: '',
        targetType: 'SCHOOL',
        selectedLevelIds: [],
        selectedClassIds: [],
        isMandatory: false,
        deadline: '',
        breakdown: '',
      });
    }
  }, [feeStructure, open, form]);

  function onSubmit(values: FeeStructureFormValues) {
    // Manual non-empty checks for multi-selects (kept out of the zod schema to
    // avoid input/output type mismatches with the resolver)
    if (values.targetType === 'LEVEL' && values.selectedLevelIds.length === 0) {
      form.setError('selectedLevelIds', {
        message: 'Select at least one level',
      });
      return;
    }
    if (values.targetType === 'CLASS' && values.selectedClassIds.length === 0) {
      form.setError('selectedClassIds', {
        message: 'Select at least one class',
      });
      return;
    }

    // Build the targets[] payload from radio + multi-select state
    let targets: TargetDto[];
    if (values.targetType === 'SCHOOL') {
      targets = [{ type: 'SCHOOL' }];
    } else if (values.targetType === 'LEVEL') {
      targets = values.selectedLevelIds.map((id) => ({
        type: 'LEVEL',
        targetId: id,
      }));
    } else {
      targets = values.selectedClassIds.map((id) => ({
        type: 'CLASS',
        targetId: id,
      }));
    }

    const payload = {
      name: values.name,
      amount: values.amount,
      targets,
      termId: values.termId || undefined,
      isMandatory: values.isMandatory ?? false,
      deadline: values.deadline || undefined,
      breakdown: values.breakdown || undefined,
    };

    if (isEdit) {
      updateFeeStructure.mutate(
        { feeStructureId: feeStructure.id, data: payload },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        },
      );
    } else {
      createFeeStructure.mutate(payload, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    }
  }

  const isPending = createFeeStructure.isPending || updateFeeStructure.isPending;
  const targetType = form.watch('targetType');
  const selectedLevelIds = form.watch('selectedLevelIds');
  const selectedClassIds = form.watch('selectedClassIds');

  // Resolved chips for the "Applies to" preview
  const previewChips = useMemo(() => {
    if (targetType === 'SCHOOL') return ['Whole school'];
    if (targetType === 'LEVEL') {
      return selectedLevelIds
        .map((id) => levels?.find((l) => l.id === id)?.name)
        .filter((n): n is string => !!n);
    }
    return selectedClassIds
      .map((id) => classes.find((c) => c.id === id)?.name)
      .filter((n): n is string => !!n);
  }, [targetType, selectedLevelIds, selectedClassIds, levels, classes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Fee Structure' : 'Create Fee Structure'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the fee structure details below.'
              : 'Create a fee and choose which students it applies to.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Tuition Fee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount — SCRUM-63 bug fix: spinner arrows removed */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₦)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      placeholder="0.00"
                      className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      value={field.value}
                      onChange={(e) => {
                        const v = e.target.valueAsNumber;
                        field.onChange(Number.isNaN(v) ? 0 : v);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Target picker */}
            <FormField
              control={form.control}
              name="targetType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Applies to</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v as FeeTargetType);
                        // Clear the unused multi-select when switching modes
                        if (v === 'SCHOOL') {
                          form.setValue('selectedLevelIds', []);
                          form.setValue('selectedClassIds', []);
                        } else if (v === 'LEVEL') {
                          form.setValue('selectedClassIds', []);
                        } else {
                          form.setValue('selectedLevelIds', []);
                        }
                      }}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="SCHOOL" id="target-school" />
                        <Label
                          htmlFor="target-school"
                          className="cursor-pointer font-normal"
                        >
                          Whole school
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="LEVEL" id="target-level" />
                        <Label
                          htmlFor="target-level"
                          className="cursor-pointer font-normal"
                        >
                          Specific levels
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="CLASS" id="target-class" />
                        <Label
                          htmlFor="target-class"
                          className="cursor-pointer font-normal"
                        >
                          Specific classes
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Multi-select: levels */}
            {targetType === 'LEVEL' && (
              <Controller
                control={form.control}
                name="selectedLevelIds"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Levels</FormLabel>
                    <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                      {(levels ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No levels yet. Create a level in School Settings first.
                        </p>
                      ) : (
                        (levels ?? []).map((level) => {
                          const checked = field.value.includes(level.id);
                          return (
                            <label
                              key={level.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => {
                                  field.onChange(
                                    checked
                                      ? field.value.filter(
                                          (id) => id !== level.id,
                                        )
                                      : [...field.value, level.id],
                                  );
                                }}
                              />
                              {level.name}
                            </label>
                          );
                        })
                      )}
                    </div>
                    {fieldState.error && (
                      <p className="text-sm font-medium text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            )}

            {/* Multi-select: classes */}
            {targetType === 'CLASS' && (
              <Controller
                control={form.control}
                name="selectedClassIds"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Classes</FormLabel>
                    <div className="max-h-44 space-y-2 overflow-y-auto rounded-md border p-3">
                      {classes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No classes yet.
                        </p>
                      ) : (
                        classes.map((cls) => {
                          const checked = field.value.includes(cls.id);
                          return (
                            <label
                              key={cls.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() => {
                                  field.onChange(
                                    checked
                                      ? field.value.filter((id) => id !== cls.id)
                                      : [...field.value, cls.id],
                                  );
                                }}
                              />
                              {cls.name}
                              {cls.levelName ? (
                                <span className="text-muted-foreground">
                                  ({cls.levelName})
                                </span>
                              ) : null}
                            </label>
                          );
                        })
                      )}
                    </div>
                    {fieldState.error && (
                      <p className="text-sm font-medium text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            )}

            {/* Selected preview chips */}
            {previewChips.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Selected ({previewChips.length})
                </Label>
                <div className="flex flex-wrap gap-1">
                  {previewChips.map((label) => (
                    <Badge key={label} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Term */}
            <FormField
              control={form.control}
              name="termId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === 'NONE' ? '' : value)
                    }
                    value={field.value || 'NONE'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All Terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">All Terms</SelectItem>
                      {terms.map((term) => (
                        <SelectItem key={term.id} value={term.id}>
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deadline */}
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Breakdown */}
            <FormField
              control={form.control}
              name="breakdown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Breakdown (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Fee breakdown details..."
                      className="min-h-[80px] resize-none"
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
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'Saving...'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create Structure'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
