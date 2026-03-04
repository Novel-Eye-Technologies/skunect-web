'use client';

import { useState, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormDatePicker } from '@/components/shared/form-date-picker';
import { Filter } from 'lucide-react';

export type FilterType = 'select' | 'text' | 'date';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterModalProps {
  filters: FilterConfig[];
  values: Record<string, string | Date | undefined>;
  onApply: (values: Record<string, string | Date | undefined>) => void;
  onReset: () => void;
  trigger?: React.ReactNode;
}

export function FilterModal({
  filters,
  values,
  onApply,
  onReset,
  trigger,
}: FilterModalProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(values);

  const handleOpen = useCallback(
    (isOpen: boolean) => {
      if (isOpen) setDraft(values);
      setOpen(isOpen);
    },
    [values],
  );

  function handleApply() {
    onApply(draft);
    setOpen(false);
  }

  function handleReset() {
    onReset();
    setOpen(false);
  }

  function updateDraft(key: string, value: string | Date | undefined) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const activeCount = Object.values(values).filter(
    (v) => v !== undefined && v !== '',
  ).length;

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow down results.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <Label>{filter.label}</Label>
              {filter.type === 'select' && filter.options && (
                <Select
                  value={(draft[filter.key] as string) ?? ''}
                  onValueChange={(val) =>
                    updateDraft(filter.key, val === '__all__' ? '' : val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={filter.placeholder ?? 'Select...'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {filter.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {filter.type === 'text' && (
                <Input
                  value={(draft[filter.key] as string) ?? ''}
                  onChange={(e) => updateDraft(filter.key, e.target.value)}
                  placeholder={filter.placeholder ?? ''}
                />
              )}
              {filter.type === 'date' && (
                <FormDatePicker
                  value={draft[filter.key] as Date | undefined}
                  onChange={(date) => updateDraft(filter.key, date)}
                  placeholder={filter.placeholder ?? 'Pick a date'}
                />
              )}
            </div>
          ))}
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
