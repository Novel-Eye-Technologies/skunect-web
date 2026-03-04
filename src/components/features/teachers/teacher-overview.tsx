'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, UserX, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/stores/auth-store';
import apiClient from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/types';

interface TeacherOverview {
  totalTeachers: number;
  activeTeachers: number;
  inactiveTeachers: number;
  suspendedTeachers: number;
  classTeachers: number;
}

async function getTeacherOverview(schoolId: string): Promise<ApiResponse<TeacherOverview>> {
  const res = await apiClient.get<ApiResponse<TeacherOverview>>(
    `/schools/${schoolId}/teachers/overview`,
  );
  return res.data;
}

export function TeacherOverviewCards() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-overview', schoolId],
    queryFn: () => getTeacherOverview(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[80px]" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: 'Total Teachers',
      value: data.totalTeachers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Active',
      value: data.activeTeachers,
      icon: UserCheck,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Inactive',
      value: data.inactiveTeachers,
      icon: UserX,
      color: 'text-gray-600',
      bg: 'bg-gray-50 dark:bg-gray-900/20',
    },
    {
      title: 'Class Teachers',
      value: data.classTeachers,
      icon: GraduationCap,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="flex items-center gap-3 pt-4 pb-4">
            <div className={`rounded-lg p-2 ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
