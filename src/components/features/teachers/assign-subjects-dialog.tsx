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
import { Loader2 } from 'lucide-react';
import { 
  useClasses, 
  useClassSubjects, 
  useAssignTeacherToSubject 
} from '@/lib/hooks/use-school-settings';
import { useTeacherSubjects } from '@/lib/hooks/use-teachers';
import type { UserListItem } from '@/lib/types/user';

interface AssignSubjectsDialogProps {
  teacher: UserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignSubjectsDialog({
  teacher,
  open,
  onOpenChange,
}: AssignSubjectsDialogProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  const { data: classes, isLoading: classesLoading } = useClasses();
  
  // Fetch subjects for the selected class to show as options
  const { data: classSubjects, isLoading: classSubjectsLoading } = useClassSubjects(selectedClassId);
  
  // Fetch teacher's current subjects to determine initial checked state
  const { refetch: refetchTeacherSubjects } = useTeacherSubjects(teacher?.id ?? '');
  const assignTeacherToSubject = useAssignTeacherToSubject();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset selection when dialog closes or class changes
  useEffect(() => {
    if (!open) {
      setSelectedClassId('');
      setSelectedSubjectId('');
    }
  }, [open]);

  useEffect(() => {
    setSelectedSubjectId('');
  }, [selectedClassId]);

  const handleSave = async () => {
    if (!selectedClassId || !selectedSubjectId || !teacher) return;
    
    setIsSaving(true);
    
    try {
      await assignTeacherToSubject.mutateAsync({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        data: { teacherId: teacher.id }
      });
      
      await refetchTeacherSubjects();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update assignment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedSubject = classSubjects?.find(s => s.subjectId === selectedSubjectId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Subjects</DialogTitle>
          <DialogDescription>
            Assign subjects to{' '}
            <span className="font-medium">
              {teacher?.firstName} {teacher?.lastName}
            </span>{' '}
            for specific classes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label htmlFor="class-select">Select Class</Label>
            <Select
              value={selectedClassId}
              onValueChange={setSelectedClassId}
              disabled={classesLoading || isSaving}
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
                      {cls.gradeLevel && (
                        <Badge variant="outline" className="text-xs">
                          {cls.gradeLevel}
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subjects List */}
          {selectedClassId && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject-select">Select Subject</Label>
                {classSubjectsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading subjects...
                  </div>
                ) : !classSubjects || classSubjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No subjects are set up for this class yet.
                  </p>
                ) : (
                  <Select
                    value={selectedSubjectId}
                    onValueChange={setSelectedSubjectId}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="subject-select">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {classSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.subjectId}>
                          {subject.subjectName}
                          {subject.subjectCode && ` (${subject.subjectCode})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedSubject?.teacherId && selectedSubject.teacherId !== teacher?.id && (
                <p className="text-sm text-amber-600">
                  Currently taught by <span className="font-medium">{selectedSubject.teacherName || 'another teacher'}</span>. Assigning will replace them.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedClassId || !selectedSubjectId || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Assignments'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
