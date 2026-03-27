'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { GraduationCap, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/stat-card';
import { useAcademicSummary } from '@/lib/hooks/use-analytics';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/lib/api/school-settings';

const GRADE_COLORS: Record<string, string> = {
  A: '#2A9D8F',
  B: '#1B2A4A',
  C: '#f59e0b',
  D: '#f97316',
  F: '#ef4444',
};

const DEFAULT_GRADE_COLOR = '#94a3b8';

export function AcademicAnalytics() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);

  const [termId, setTermId] = useState('');
  const [classId, setClassId] = useState('');

  const { data: classesResponse } = useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
    select: (res) => res.data,
  });

  const classes = classesResponse ?? [];

  const { data, isLoading } = useAcademicSummary({
    termId: termId || undefined,
    classId: classId || undefined,
  });

  const subjectAverages = data?.subjectAverages ?? [];
  const gradeDistribution = data?.distributionByGrade ?? [];
  const topPerformers = data?.topPerformers ?? [];

  if (isLoading) {
    return <AcademicAnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 p-4">
          <div className="space-y-1.5">
            <Label>Term</Label>
            <Select
              value={termId}
              onValueChange={(v) => setTermId(v === 'ALL' ? '' : v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Terms</SelectItem>
                <SelectItem value="FIRST">First Term</SelectItem>
                <SelectItem value="SECOND">Second Term</SelectItem>
                <SelectItem value="THIRD">Third Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Class</Label>
            <Select
              value={classId}
              onValueChange={(v) => setClassId(v === 'ALL' ? '' : v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                    {cls.gradeLevel ? ` (${cls.gradeLevel})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Average Score"
          value={`${(data?.averageScore ?? 0).toFixed(1)}%`}
          icon={GraduationCap}
        />
        <StatCard
          title="Top Performers"
          value={topPerformers.length}
          icon={Award}
          description="Students above average"
        />
        <StatCard
          title="Subjects Analysed"
          value={subjectAverages.length}
          icon={TrendingUp}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart - Subject Averages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Average Scores by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectAverages.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No subject data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectAverages}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="subjectName"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="averageScore"
                    name="Average Score"
                    fill="#2A9D8F"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {gradeDistribution.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No grade data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="grade"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label={(props: any) =>
                      `${props.grade} (${props.percentage.toFixed(0)}%)`
                    }
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell
                        key={`grade-${index}`}
                        fill={
                          GRADE_COLORS[entry.grade] ?? DEFAULT_GRADE_COLOR
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          {topPerformers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No performer data available.
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Average Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.slice(0, 10).map((student, index) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>{student.studentName}</TableCell>
                      <TableCell>{student.className}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {student.averageScore.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AcademicAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[380px] rounded-lg lg:col-span-2" />
        <Skeleton className="h-[380px] rounded-lg" />
      </div>
      <Skeleton className="h-[300px] rounded-lg" />
    </div>
  );
}
