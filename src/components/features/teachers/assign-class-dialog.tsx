'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useClasses, useUpdateClass } from '@/lib/hooks/use-school-settings';
import type { UserListItem } from '@/lib/types/user';

interface AssignClassDialogProps {
  teacher: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignClassDialog({
  teacher,
  open,
  onOpenChange,
}: AssignClassDialogProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const { data: classes, isLoading: classesLoading } = useClasses();
  const updateClass = useUpdateClass();

  useEffect(() => {
    if (!open) {
      setSelectedClassId('');
    }
  }, [open]);

  function handleAssign() {
    if (!selectedClassId || !teacher) return;
    const cls = classes?.find((c) => c.id === selectedClassId);
    if (!cls) return;

    updateClass.mutate(
      {
        classId: selectedClassId,
        data: {
          name: cls.name,
          section: cls.section ?? undefined,
          capacity: cls.capacity,
          classTeacherId: teacher.id,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  }

  const selectedClass = classes?.find((c) => c.id === selectedClassId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign as Class Teacher</DialogTitle>
          <DialogDescription>
            Assign{' '}
            <span className="font-medium">
              {teacher?.firstName} {teacher?.lastName}
            </span>{' '}
            as the class teacher for a class.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="class-select">Class</Label>
            <Select
              value={selectedClassId}
              onValueChange={setSelectedClassId}
              disabled={classesLoading}
            >
              <SelectTrigger id="class-select">
                <SelectValue
                  placeholder={
                    classesLoading ? 'Loading classes...' : 'Select a class'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(classes ?? []).map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    <span className="flex items-center gap-2">
                      {cls.name}
                      {cls.section && (
                        <Badge variant="outline" className="text-xs">
                          {cls.section}
                        </Badge>
                      )}
                      {cls.classTeacherName && (
                        <span className="text-xs text-muted-foreground">
                          ({cls.classTeacherName})
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClass?.classTeacherName && (
            <p className="text-sm text-amber-600">
              This class currently has{' '}
              <span className="font-medium">
                {selectedClass.classTeacherName}
              </span>{' '}
              as class teacher. Assigning will replace them.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedClassId || updateClass.isPending}
            >
              {updateClass.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
