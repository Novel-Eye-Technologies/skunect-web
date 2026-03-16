'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { TimetableGrid } from '@/components/features/timetable/timetable-grid';
import { useTimetableConfig, useTimetableSlots, useCreateTimetableSlot, useDeleteTimetableSlot } from '@/lib/hooks/use-timetable';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses, getSessions } from '@/lib/api/school-settings';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TimetablePage() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const [sessionId, setSessionId] = useState('');
  const [classId, setClassId] = useState('');
  const [slotDialog, setSlotDialog] = useState<{
    open: boolean;
    day: string;
    period: number;
  }>({ open: false, day: '', period: 0 });
  const [slotSubjectId, setSlotSubjectId] = useState('');
  const [slotTeacherId, setSlotTeacherId] = useState('');
  const [slotLabel, setSlotLabel] = useState('');

  const { data: config, isLoading: configLoading } = useTimetableConfig(sessionId || undefined);
  const { data: slots = [], isLoading: slotsLoading } = useTimetableSlots(
    sessionId || undefined,
    classId || undefined,
  );
  const createSlot = useCreateTimetableSlot();
  const deleteSlot = useDeleteTimetableSlot();

  const { data: sessionsResponse } = useQuery({
    queryKey: ['sessions', schoolId ?? ''],
    queryFn: () => getSessions(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId ?? ''],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const sessions = sessionsResponse ?? [];
  const classes = classesResponse ?? [];

  const handleAddSlot = (day: string, period: number) => {
    setSlotDialog({ open: true, day, period });
    setSlotSubjectId('');
    setSlotTeacherId('');
    setSlotLabel('');
  };

  const handleCreateSlot = () => {
    if (!sessionId || !classId) return;
    createSlot.mutate(
      {
        classId,
        sessionId,
        dayOfWeek: slotDialog.day,
        periodNumber: slotDialog.period,
        subjectId: slotSubjectId || undefined,
        teacherId: slotTeacherId || undefined,
        label: slotLabel || undefined,
      },
      { onSuccess: () => setSlotDialog({ open: false, day: '', period: 0 }) },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable"
        description="Manage class timetables and schedules."
      />

      <div className="flex items-center gap-3">
        <Select value={sessionId} onValueChange={setSessionId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s: { id: string; name: string }) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c: { id: string; name: string }) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sessionId && classId ? (
        <TimetableGrid
          config={config}
          slots={slots}
          onAddSlot={handleAddSlot}
          onDeleteSlot={(id) => deleteSlot.mutate(id)}
          isLoading={configLoading || slotsLoading}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Select a session and class to view the timetable.
        </div>
      )}

      <Dialog
        open={slotDialog.open}
        onOpenChange={(open) =>
          setSlotDialog({ ...slotDialog, open })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Slot &mdash; {slotDialog.day} Period {slotDialog.period}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label (e.g. &quot;Assembly&quot;, &quot;Break&quot;)</Label>
              <Input value={slotLabel} onChange={(e) => setSlotLabel(e.target.value)} placeholder="Optional label" />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleCreateSlot} disabled={createSlot.isPending}>
                {createSlot.isPending ? 'Creating...' : 'Create Slot'}
              </Button>
              <Button variant="outline" onClick={() => setSlotDialog({ open: false, day: '', period: 0 })}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
