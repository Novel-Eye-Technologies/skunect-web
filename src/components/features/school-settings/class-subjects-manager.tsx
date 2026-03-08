'use client';

import { useState } from 'react';
import { Loader2, Plus, Trash2, UserCog, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  useClassSubjects,
  useAssignSubjectsToClass,
  useRemoveSubjectFromClass,
  useAssignTeacherToSubject,
  useSubjects,
} from '@/lib/hooks/use-school-settings';
import { useTeachers } from '@/lib/hooks/use-teachers';
import type { ClassSubject } from '@/lib/types/school';

interface ClassSubjectsManagerProps {
  classId: string;
  className: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassSubjectsManager({
  classId,
  className,
  open,
  onOpenChange,
}: ClassSubjectsManagerProps) {
  const { data: classSubjects, isLoading } = useClassSubjects(classId);
  const { data: allSubjects } = useSubjects();
  const { data: teachersResponse } = useTeachers({ size: 200 });
  const teachers = teachersResponse?.data ?? [];

  const assignSubjects = useAssignSubjectsToClass();
  const removeSubject = useRemoveSubjectFromClass();
  const assignTeacher = useAssignTeacherToSubject();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [changeTeacherSubject, setChangeTeacherSubject] =
    useState<ClassSubject | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [removeSubjectId, setRemoveSubjectId] = useState<string | null>(null);

  // Subjects not yet assigned to this class
  const unassignedSubjects = (allSubjects ?? []).filter(
    (s) => !(classSubjects ?? []).some((cs) => cs.subjectId === s.id),
  );

  function handleAddSubjects() {
    if (selectedSubjectIds.length === 0) return;
    assignSubjects.mutate(
      { classId, data: { subjectIds: selectedSubjectIds } },
      {
        onSuccess: () => {
          setAddDialogOpen(false);
          setSelectedSubjectIds([]);
        },
      },
    );
  }

  function handleChangeTeacher() {
    if (!changeTeacherSubject) return;
    assignTeacher.mutate(
      {
        classId,
        subjectId: changeTeacherSubject.subjectId,
        data: {
          teacherId:
            selectedTeacherId === '__class_teacher__'
              ? null
              : selectedTeacherId,
        },
      },
      {
        onSuccess: () => {
          setChangeTeacherSubject(null);
          setSelectedTeacherId('');
        },
      },
    );
  }

  function handleRemoveSubject() {
    if (!removeSubjectId) return;
    removeSubject.mutate(
      { classId, subjectId: removeSubjectId },
      { onSuccess: () => setRemoveSubjectId(null) },
    );
  }

  function toggleSubjectSelection(subjectId: string) {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Subjects — {className}</SheetTitle>
            <SheetDescription>
              Manage subject-teacher assignments for this class. Subjects without
              a specific teacher are taught by the class teacher.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                disabled={unassignedSubjects.length === 0}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Subjects
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !classSubjects || classSubjects.length === 0 ? (
              <EmptyState
                title="No subjects assigned"
                description="Add subjects to this class to get started."
                icon={BookOpen}
                action={
                  <Button
                    size="sm"
                    onClick={() => setAddDialogOpen(true)}
                    disabled={unassignedSubjects.length === 0}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Subjects
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classSubjects.map((cs) => (
                    <TableRow key={cs.id}>
                      <TableCell className="font-medium">
                        {cs.subjectName}
                      </TableCell>
                      <TableCell>{cs.subjectCode ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {cs.teacherName ?? '—'}
                          {cs.isClassTeacher && (
                            <Badge variant="secondary" className="text-xs">
                              Class Teacher
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Change teacher"
                            onClick={() => {
                              setChangeTeacherSubject(cs);
                              setSelectedTeacherId(
                                cs.isClassTeacher
                                  ? '__class_teacher__'
                                  : cs.teacherId ?? '',
                              );
                            }}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            title="Remove subject"
                            onClick={() => setRemoveSubjectId(cs.subjectId)}
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
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Subjects Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subjects to {className}</DialogTitle>
            <DialogDescription>
              Select subjects to assign to this class. They will be taught by the
              class teacher by default.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {unassignedSubjects.map((subject) => (
              <label
                key={subject.id}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-muted cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSubjectIds.includes(subject.id)}
                  onChange={() => toggleSubjectSelection(subject.id)}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="flex-1">{subject.name}</span>
                <span className="text-muted-foreground text-sm">
                  {subject.code}
                </span>
              </label>
            ))}
            {unassignedSubjects.length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center">
                All subjects have been assigned to this class.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setSelectedSubjectIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSubjects}
              disabled={
                selectedSubjectIds.length === 0 || assignSubjects.isPending
              }
            >
              {assignSubjects.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add {selectedSubjectIds.length > 0
                ? `(${selectedSubjectIds.length})`
                : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Teacher Dialog */}
      <Dialog
        open={!!changeTeacherSubject}
        onOpenChange={(open) => {
          if (!open) {
            setChangeTeacherSubject(null);
            setSelectedTeacherId('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change Teacher — {changeTeacherSubject?.subjectName}
            </DialogTitle>
            <DialogDescription>
              Select a specialist teacher for this subject, or reset to the class
              teacher.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__class_teacher__">
                Class Teacher (default)
              </SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangeTeacherSubject(null);
                setSelectedTeacherId('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeTeacher}
              disabled={!selectedTeacherId || assignTeacher.isPending}
            >
              {assignTeacher.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Subject Confirmation */}
      <ConfirmDialog
        open={!!removeSubjectId}
        onOpenChange={(open) => !open && setRemoveSubjectId(null)}
        title="Remove Subject"
        description="Are you sure you want to remove this subject from the class? This will also remove the teacher assignment."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleRemoveSubject}
        isLoading={removeSubject.isPending}
      />
    </>
  );
}
