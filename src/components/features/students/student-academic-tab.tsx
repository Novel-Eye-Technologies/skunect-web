'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, FileText, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import { formatDate } from '@/lib/utils/format-date';

interface ReportCard {
  id: string;
  studentId: string;
  termId: string;
  termName: string;
  totalScore: number;
  averageScore: number;
  position: number | null;
  totalStudents: number | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

async function getStudentReportCards(
  schoolId: string,
  studentId: string,
): Promise<ApiResponse<ReportCard[]>> {
  const res = await apiClient.get<ApiResponse<ReportCard[]>>(
    `/schools/${schoolId}/students/${studentId}/report-cards`,
  );
  return res.data;
}

interface StudentAcademicTabProps {
  studentId: string;
}

export function StudentAcademicTab({ studentId }: StudentAcademicTabProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  const { data, isLoading } = useQuery({
    queryKey: ['student-report-cards', schoolId, studentId],
    queryFn: () => getStudentReportCards(schoolId!, studentId),
    enabled: !!schoolId && !!studentId,
    select: (res) => res.data,
  });

  const reportCards = data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[120px] w-full" />
      </div>
    );
  }

  if (reportCards.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-2 h-8 w-8" />
          <p>No academic records found for this student.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reportCards.map((rc) => (
        <Card key={rc.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                {rc.termName}
              </CardTitle>
              <StatusBadge status={rc.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Average Score</p>
                <p className="text-lg font-semibold">{rc.averageScore?.toFixed(1) ?? '-'}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Score</p>
                <p className="text-lg font-semibold">{rc.totalScore ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Position</p>
                <p className="text-lg font-semibold">
                  {rc.position != null
                    ? `${rc.position}${rc.totalStudents ? ` / ${rc.totalStudents}` : ''}`
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Published</p>
                <p className="text-sm font-medium">
                  {rc.publishedAt ? formatDate(rc.publishedAt) : 'Not published'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
