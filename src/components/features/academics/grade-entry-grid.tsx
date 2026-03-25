'use client';

import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
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
import { EmptyState } from '@/components/shared/empty-state';
import {
  useAssessments,
  useAssessmentScores,
  useSubmitBulkScores,
} from '@/lib/hooks/use-academics';
import { useStudents } from '@/lib/hooks/use-students';
import type { BulkScoreEntry } from '@/lib/types/academics';

interface ScoreRow {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  score: number | null;
}

export function GradeEntryGrid() {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [rows, setRows] = useState<ScoreRow[]>([]);

  // Load assessments list
  const { data: assessmentsResponse } = useAssessments({ size: 200 });
  const assessments = assessmentsResponse?.data ?? [];

  // Find selected assessment for max score
  const selectedAssessment = assessments.find(
    (a) => a.id === selectedAssessmentId,
  );

  // Load students for the selected assessment's class
  const { data: studentsResponse } = useStudents({ classId: selectedAssessment?.classId });
  const students = useMemo(() => studentsResponse?.data ?? [], [studentsResponse]);

  // Load scores for selected assessment
  const { data: scores, isLoading: isLoadingScores } =
    useAssessmentScores(selectedAssessmentId);

  const submitScores = useSubmitBulkScores();

  // Build rows when scores load
  useEffect(() => {
    if (scores) {
      setRows(
        scores.map((s) => {
          const student = students.find((st) => st.id === s.studentId);
          return {
            studentId: s.studentId,
            studentName: s.studentName,
            admissionNumber: s.admissionNumber || student?.admissionNumber || 'N/A',
            score: s.score,
          };
        }),
      );
    }
  }, [scores, students]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function updateScore(index: number, value: string) {
    const numValue = value === '' ? null : Number(value);
    const maxScore = selectedAssessment?.maxScore ?? 100;

    // Validate: must be between 0 and maxScore
    if (numValue !== null && (numValue < 0 || numValue > maxScore)) return;

    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, score: numValue } : row,
      ),
    );
  }

  function handleSubmit() {
    if (!selectedAssessmentId || rows.length === 0) return;

    const validScores: BulkScoreEntry[] = rows
      .filter((row) => row.score !== null)
      .map((row) => ({
        studentId: row.studentId,
        score: row.score!,
      }));

    if (validScores.length === 0) return;

    submitScores.mutate({
      assessmentId: selectedAssessmentId,
      data: { grades: validScores },
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Assessment Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-2">
            <Label>Assessment</Label>
            <Select
              value={selectedAssessmentId}
              onValueChange={setSelectedAssessmentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((assessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.title} - {assessment.className} ({assessment.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grade Entry Grid */}
      {!selectedAssessmentId ? (
        <EmptyState
          title="Select an assessment"
          description="Choose an assessment above to load the student list for grade entry."
        />
      ) : isLoadingScores ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No students found"
          description="There are no students for this assessment."
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Enter Scores ({rows.length} student{rows.length !== 1 ? 's' : ''})
              </CardTitle>
              {selectedAssessment && (
                <span className="text-sm text-muted-foreground">
                  Max Score: {selectedAssessment.maxScore}
                </span>
              )}
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
                    <TableHead className="w-[140px]">
                      Score (/{selectedAssessment?.maxScore ?? 100})
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={row.studentId}>
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.studentName}
                      </TableCell>
                      <TableCell>{row.admissionNumber}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={selectedAssessment?.maxScore ?? 100}
                          value={row.score ?? ''}
                          onChange={(e) => updateScore(index, e.target.value)}
                          placeholder="--"
                          className="h-8 w-[100px]"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary & Submit */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Entered: {rows.filter((r) => r.score !== null).length} /{' '}
                {rows.length}
              </p>
              <Button
                onClick={handleSubmit}
                disabled={
                  submitScores.isPending ||
                  rows.filter((r) => r.score !== null).length === 0
                }
              >
                {submitScores.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Scores
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
