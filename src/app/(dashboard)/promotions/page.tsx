'use client';

import { useState } from 'react';
import { Loader2, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { useClasses, useSchoolSettings } from '@/lib/hooks/use-school-settings';
import { useLevels } from '@/lib/hooks/use-levels';
import {
  useEligibleStudents,
  useBulkPromote,
  usePromoteLevel,
  usePromotionHistory,
} from '@/lib/hooks/use-promotions';
import type { PromoteLevelResponse } from '@/lib/types/promotion';
import { cn } from '@/lib/utils';

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Promotions"
        description="Promote students between classes (one-by-one) or bulk-promote an entire level (auto-mapped by class suffix)."
      />

      <Tabs defaultValue="by-class" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="by-class">By Class</TabsTrigger>
          <TabsTrigger value="by-level">By Level</TabsTrigger>
        </TabsList>

        <TabsContent value="by-class" className="space-y-6">
          <PromoteByClassFlow />
        </TabsContent>

        <TabsContent value="by-level" className="space-y-6">
          <PromoteByLevelFlow />
        </TabsContent>
      </Tabs>

      <PromotionHistorySection />
    </div>
  );
}

// ─── By Class flow (existing) ────────────────────────────────────────

function PromoteByClassFlow() {
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
    <>
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
                          selectedStudents.includes(student.studentId) &&
                            'bg-teal-50 dark:bg-teal-950/20',
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

      {selectedStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Select Target Class &amp; Confirm</CardTitle>
            <CardDescription>
              {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}{' '}
              selected for promotion.
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
    </>
  );
}

// ─── By Level flow (SCRUM-63 PR 6) ───────────────────────────────────

function PromoteByLevelFlow() {
  const { data: settings } = useSchoolSettings();
  const { data: levels } = useLevels();

  const [fromLevelId, setFromLevelId] = useState('');
  const [toLevelId, setToLevelId] = useState('');
  const [lastResult, setLastResult] = useState<PromoteLevelResponse | null>(null);

  const sessionId = settings?.currentSessionId ?? '';
  const promoteLevel = usePromoteLevel();

  // Sort levels by ordinal so the dropdown reads top-to-bottom in school progression order
  const sortedLevels = [...(levels ?? [])].sort((a, b) => a.ordinal - b.ordinal);
  // Suggest the next level (by ordinal) as a sensible default for the target dropdown
  const fromLevel = sortedLevels.find((l) => l.id === fromLevelId);

  function handlePromoteLevel() {
    if (!fromLevelId || !toLevelId || !sessionId) return;
    promoteLevel.mutate(
      { fromLevelId, toLevelId, sessionId },
      {
        onSuccess: (response) => {
          setLastResult(response.data ?? null);
        },
      },
    );
  }

  function reset() {
    setFromLevelId('');
    setToLevelId('');
    setLastResult(null);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Promote an Entire Level</CardTitle>
          <CardDescription>
            Move every active student in the source level to the matching class in the target
            level. Classes are auto-mapped by suffix &mdash; <strong>JSS 1A &rarr; JSS 2A</strong>,{' '}
            <strong>JSS 1B &rarr; JSS 2B</strong>, and so on. Students whose source class has
            no matching destination are listed below for manual handling via the &ldquo;By
            Class&rdquo; tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source Level</label>
              <Select value={fromLevelId} onValueChange={setFromLevelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source level" />
                </SelectTrigger>
                <SelectContent>
                  {sortedLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name} ({level.classCount} class
                      {level.classCount === 1 ? '' : 'es'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Level</label>
              <Select value={toLevelId} onValueChange={setToLevelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target level" />
                </SelectTrigger>
                <SelectContent>
                  {sortedLevels
                    .filter((l) => l.id !== fromLevelId)
                    .map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name} ({level.classCount} class
                        {level.classCount === 1 ? '' : 'es'})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {fromLevel && fromLevel.classCount === 0 && (
            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              <AlertTriangle className="mr-1 inline h-4 w-4" />
              {fromLevel.name} has no classes &mdash; nothing to promote from.
            </p>
          )}

          <div className="flex justify-end gap-2">
            {lastResult && (
              <Button variant="outline" onClick={reset}>
                Reset
              </Button>
            )}
            <Button
              onClick={handlePromoteLevel}
              disabled={
                !fromLevelId ||
                !toLevelId ||
                !sessionId ||
                promoteLevel.isPending ||
                (fromLevel != null && fromLevel.classCount === 0)
              }
            >
              {promoteLevel.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Promote Level
            </Button>
          </div>
        </CardContent>
      </Card>

      {lastResult && lastResult.promoted && lastResult.promoted.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Promoted ({lastResult.promoted.length})</CardTitle>
            <CardDescription>
              Students moved to their suffix-matched destination class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead />
                    <TableHead>To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastResult.promoted.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.studentName}</TableCell>
                      <TableCell>{p.admissionNumber}</TableCell>
                      <TableCell>{p.fromClassName}</TableCell>
                      <TableCell className="text-center">
                        <ArrowRight className="mx-auto h-4 w-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell>{p.toClassName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {lastResult && lastResult.unmatched && lastResult.unmatched.length > 0 && (
        <Card className="border-amber-300 dark:border-amber-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Unmatched ({lastResult.unmatched.length})
            </CardTitle>
            <CardDescription>
              These students could not be auto-mapped because no class in the target level has
              the same suffix as their source class. Use the &ldquo;By Class&rdquo; tab to move
              them manually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Source Class</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastResult.unmatched.map((u) => (
                    <TableRow key={u.studentId}>
                      <TableCell className="font-medium">{u.studentName}</TableCell>
                      <TableCell>{u.admissionNumber}</TableCell>
                      <TableCell>{u.sourceClassName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// ─── Promotion History (shared) ──────────────────────────────────────

function PromotionHistorySection() {
  const { data: settings } = useSchoolSettings();
  const sessionId = settings?.currentSessionId ?? '';
  const { data: history } = usePromotionHistory(sessionId || undefined);

  if (!history || history.length === 0) return null;

  return (
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
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>
                    {record.fromLevelName ? (
                      <span className="text-xs text-muted-foreground">
                        {record.fromLevelName} &middot;{' '}
                      </span>
                    ) : null}
                    {record.fromClassName}
                  </TableCell>
                  <TableCell className="text-center">
                    <ArrowRight className="mx-auto h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    {record.toLevelName ? (
                      <span className="text-xs text-muted-foreground">
                        {record.toLevelName} &middot;{' '}
                      </span>
                    ) : null}
                    {record.toClassName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {record.promotionType?.replace('_', ' ').toLowerCase()}
                    </Badge>
                  </TableCell>
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
  );
}
