'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';

interface SiblingInfo {
  id: string;
  schoolId: string;
  classId: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  gender: string;
  photoUrl: string | null;
  status: string;
  isActive: boolean;
}

async function getStudentSiblings(
  schoolId: string,
  studentId: string,
): Promise<ApiResponse<SiblingInfo[]>> {
  const res = await apiClient.get<ApiResponse<SiblingInfo[]>>(
    `/schools/${schoolId}/students/${studentId}/siblings`,
  );
  return res.data;
}

interface StudentSiblingsTabProps {
  studentId: string;
}

export function StudentSiblingsTab({ studentId }: StudentSiblingsTabProps) {
  const router = useRouter();
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  const { data, isLoading } = useQuery({
    queryKey: ['student-siblings', schoolId, studentId],
    queryFn: () => getStudentSiblings(schoolId!, studentId),
    enabled: !!schoolId && !!studentId,
    select: (res) => res.data,
  });

  const siblings = data ?? [];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    );
  }

  if (siblings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Users className="mx-auto mb-2 h-8 w-8" />
          <p>No siblings found for this student.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {siblings.map((sibling) => {
        const initials = `${sibling.firstName.charAt(0)}${sibling.lastName.charAt(0)}`;
        return (
          <Card key={sibling.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={sibling.photoUrl ?? undefined} alt={initials} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {sibling.firstName} {sibling.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sibling.admissionNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={sibling.status} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/students/${sibling.id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
