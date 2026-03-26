'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormDatePicker } from '@/components/shared/form-date-picker';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/lib/api/school-settings';
import { getStudents } from '@/lib/api/students';
import { useSubmitBulkAttendance } from '@/lib/hooks/use-attendance';
import type { BulkAttendanceEntry } from '@/lib/types/attendance';
import { cn } from '@/lib/utils';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

interface StudentAttendanceRow {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  status: AttendanceStatus;
  note: string;
}

export function AttendanceGrid() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);

  const submitAttendance = useSubmitBulkAttendance();

  // Load classes
  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });
  const classes = classesResponse ?? [];

  // Load students for selected class
  const { data: studentsResponse, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students', schoolId, selectedClassId],
    queryFn: () =>
      getStudents(schoolId!, { classId: selectedClassId, size: 200 }),
    enabled: !!schoolId && !!selectedClassId,
  });

  // Build rows when students load — only include active students
  useEffect(() => {
    const students = studentsResponse?.data ?? [];
    setRows(
      students
        .filter((s) => s.status === 'ACTIVE')
        .map((s) => ({
          studentId: s.id,
          studentName: `${s.firstName} ${s.lastName}`,
          admissionNumber: s.admissionNumber,
          status: 'PRESENT' as AttendanceStatus,
          note: '',
        })),
    );
  }, [studentsResponse]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function updateStatus(index: number, status: AttendanceStatus) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, status } : row)),
    );
  }

  function updateNote(index: number, note: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, note } : row)),
    );
  }

  function markAll(status: AttendanceStatus) {
    setRows((prev) => prev.map((row) => ({ ...row, status })));
  }

  function handleSubmit() {
    if (!selectedClassId || !selectedDate || rows.length === 0) return;

    const records: BulkAttendanceEntry[] = rows.map((row) => ({
      studentId: row.studentId,
      status: row.status,
      ...(row.note ? { notes: row.note } : {}),
    }));

    submitAttendance.mutate({
      classId: selectedClassId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      records,
    });
  }

  function getRowBg(status: AttendanceStatus) {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-50 dark:bg-green-950/20';
      case 'ABSENT':
        return 'bg-red-50 dark:bg-red-950/20';
      case 'LATE':
        return 'bg-amber-50 dark:bg-amber-950/20';
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class & Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                      {cls.section ? ` (${cls.section})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <FormDatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Select date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Grid */}
      {!selectedClassId ? (
        <EmptyState
          title="Select a class"
          description="Choose a class above to load the student list for attendance marking."
        />
      ) : isLoadingStudents ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No students found"
          description="There are no students in this class. Add students first."
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Mark Attendance ({rows.length} student{rows.length !== 1 ? 's' : ''})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAll('PRESENT')}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4 text-green-600" />
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAll('ABSENT')}
                >
                  <XCircle className="mr-1 h-4 w-4 text-red-600" />
                  Mark All Absent
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow
                      key={row.studentId}
                      className={cn(getRowBg(row.status), 'transition-colors')}
                    >
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.studentName}
                      </TableCell>
                      <TableCell>{row.admissionNumber}</TableCell>
                      <TableCell className="text-center">
                        <input
                          type="radio"
                          name={`status-${row.studentId}`}
                          checked={row.status === 'PRESENT'}
                          onChange={() => updateStatus(index, 'PRESENT')}
                          className="h-4 w-4 accent-green-600"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <input
                          type="radio"
                          name={`status-${row.studentId}`}
                          checked={row.status === 'ABSENT'}
                          onChange={() => updateStatus(index, 'ABSENT')}
                          className="h-4 w-4 accent-red-600"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <input
                          type="radio"
                          name={`status-${row.studentId}`}
                          checked={row.status === 'LATE'}
                          onChange={() => updateStatus(index, 'LATE')}
                          className="h-4 w-4 accent-amber-600"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.note}
                          onChange={(e) => updateNote(index, e.target.value)}
                          placeholder="Optional note..."
                          className="h-8 w-[180px]"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Present: {rows.filter((r) => r.status === 'PRESENT').length}
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Absent: {rows.filter((r) => r.status === 'ABSENT').length}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Late: {rows.filter((r) => r.status === 'LATE').length}
                </span>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitAttendance.isPending || !selectedDate}
              >
                {submitAttendance.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
