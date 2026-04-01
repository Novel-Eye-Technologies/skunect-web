'use client';

import { useQuery } from '@tanstack/react-query';
import { HeartPulse, AlertCircle, Smile } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';
import { formatDate } from '@/lib/utils/format-date';

interface WelfareLog {
  id: string;
  studentId: string;
  date: string;
  type: string;
  notes: string;
  severity: string;
  reportedBy: string;
  createdAt: string;
}

async function getStudentWelfareLogs(
  schoolId: string,
  studentId: string,
): Promise<ApiResponse<WelfareLog[]>> {
  const res = await apiClient.get<ApiResponse<WelfareLog[]>>(
    `/schools/${schoolId}/welfare-logs`,
    { params: { studentId } },
  );
  return res.data;
}

interface StudentDisciplineTabProps {
  studentId: string;
}

const severityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function StudentDisciplineTab({ studentId }: StudentDisciplineTabProps) {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  const { data, isLoading } = useQuery({
    queryKey: ['student-welfare-logs', schoolId, studentId],
    queryFn: () => getStudentWelfareLogs(schoolId!, studentId),
    enabled: !!schoolId && !!studentId,
    select: (res) => res.data,
  });

  const welfareLogs = data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    );
  }

  if (welfareLogs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Smile className="mx-auto mb-2 h-8 w-8" />
          <p>No welfare or discipline records found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {welfareLogs.map((log) => (
        <Card key={log.id}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-md bg-muted p-2">
                  {log.severity === 'CRITICAL' || log.severity === 'HIGH' ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <HeartPulse className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{log.type}</p>
                    <Badge
                      variant="secondary"
                      className={severityColors[log.severity] ?? ''}
                    >
                      {log.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.notes}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(log.date)} &middot; Reported by {log.reportedBy}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
