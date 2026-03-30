'use client';

import { useState } from 'react';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { useClasses, useSchoolSettings } from '@/lib/hooks/use-school-settings';
import {
  useEligibleStudents,
  useBulkPromote,
  usePromotionHistory,
} from '@/lib/hooks/use-promotions';
import { cn } from '@/lib/utils';

export default function PromotionsPage() {
  const { data: settings } = useSchoolSettings();
  const { data: classes } = useClasses();

  const [, setStep] = useState(1);
  const [sourceClassId, setSourceClassId] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const sessionId = settings?.currentSessionId ?? '';

  const { data: eligible, isLoading: isLoadingEligible } = useEligibleStudents(
    sourceClassId,
    sessionId,
  );
  const { data: history } = usePromotionHistory(sessionId || undefined);
  const promote = useBulkPromote();

  function toggleStudent(studentId: string) {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  }

  function selectAllEligible() {
    if (!eligible) return;
    setSelectedStudents(eligible.filter((s) => s.eligible).map((s) => s.studentId));
  }

  function handlePromote() {
    if (!sourceClassId || !targetClassId || selectedStudents.length === 0 || !sessionId) return;
    promote.mutate(
      {
        fromClassId: sourceClassId,
        toClassId: targetClassId,
        sessionId,
        studentIds: selectedStudents,
      },
      {
        onSuccess: () => {
          setStep(1);
          setSourceClassId('');
          setTargetClassId('');
          setSelectedStudents([]);
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Promotions"
        description="Promote students to the next class based on their academic performance."
      />

      {/* Step 1: Select source class */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Select Source Class</CardTitle>
          <CardDescription>Choose the class to promote students from.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              value={sourceClassId}
              onValueChange={(val) => {
                setSourceClassId(val);
                setSelectedStudents([]);
                setStep(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source class" />
              </SelectTrigger>
              <SelectContent>
                {(classes ?? []).map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Eligible students table */}
      {sourceClassId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Step 2: Review Eligible Students</CardTitle>
                <CardDescription>
                  Students above the minimum promotion score are marked eligible.
                </CardDescription>
              </div>
              {eligible && eligible.length > 0 && (
                <Button variant="outline" size="sm" onClick={selectAllEligible}>
                  Select All Eligible
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingEligible ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !eligible || eligible.length === 0 ? (
              <EmptyState
                title="No students found"
                description="No active students in this class."
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]" />
                      <TableHead>Student Name</TableHead>
                      <TableHead>Admission No</TableHead>
                      <TableHead className="text-right">Average Score</TableHead>
                      <TableHead className="text-center">Eligible</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eligible.map((student) => (
                      <TableRow
                        key={student.studentId}
                        className={cn(
                          selectedStudents.includes(student.studentId) && 'bg-teal-50 dark:bg-teal-950/20',
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.studentId)}
                            onCheckedChange={() => toggleStudent(student.studentId)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.admissionNumber}</TableCell>
                        <TableCell className="text-right">
                          {(student.averageScore ?? 0).toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={student.eligible ? 'default' : 'destructive'}>
                            {student.eligible ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select target class & confirm */}
      {selectedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Select Target Class & Confirm</CardTitle>
            <CardDescription>
              {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
              for promotion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select value={targetClassId} onValueChange={setTargetClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target class" />
                </SelectTrigger>
                <SelectContent>
                  {(classes ?? [])
                    .filter((cls) => cls.id !== sourceClassId)
                    .map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handlePromote}
                disabled={!targetClassId || promote.isPending}
              >
                {promote.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Promote {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotion History */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Promotion History</CardTitle>
            <CardDescription>Previous promotions for the current session.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead />
                    <TableHead>To</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.studentName}
                      </TableCell>
                      <TableCell>{record.fromClassName}</TableCell>
                      <TableCell className="text-center">
                        <ArrowRight className="mx-auto h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>{record.toClassName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
