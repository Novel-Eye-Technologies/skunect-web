'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { WelfareFormDialog } from '@/components/features/welfare/welfare-form-dialog';
import { HealthRecordFormDialog } from '@/components/features/welfare/health-record-form-dialog';
import { MoodFormDialog } from '@/components/features/welfare/mood-form-dialog';
import { MoodCharts } from '@/components/features/welfare/mood-charts';
import { StudentMoodHistoryDialog } from '@/components/features/welfare/student-mood-history-dialog';
import { useWelfareRecords } from '@/lib/hooks/use-welfare';
import { useHealthRecords } from '@/lib/hooks/use-health-records';
import { useMoodEntries } from '@/lib/hooks/use-mood';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { getClasses } from '@/lib/api/school-settings';
import type { WelfareRecord } from '@/lib/types/welfare';
import type { HealthRecord } from '@/lib/types/health-record';
import type { MoodEntry } from '@/lib/types/mood';
import { RECORD_TYPES, SEVERITY_OPTIONS } from '@/lib/types/health-record';
import { MOOD_OPTIONS } from '@/lib/types/mood';
import { FormDatePicker } from '@/components/shared/form-date-picker';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const severityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

const recordTypeLabels: Record<string, string> = {
  ALLERGY: 'Allergy',
  CONDITION: 'Condition',
  MEDICATION: 'Medication',
  VACCINATION: 'Vaccination',
  INCIDENT: 'Incident',
  NOTE: 'Note',
};

const moodColors: Record<string, string> = {
  HAPPY: 'bg-emerald-100 text-emerald-700',
  SAD: 'bg-blue-100 text-blue-700',
  ANGRY: 'bg-red-100 text-red-700',
  ANXIOUS: 'bg-amber-100 text-amber-700',
  NEUTRAL: 'bg-gray-100 text-gray-700',
  EXCITED: 'bg-purple-100 text-purple-700',
};

const moodEmojis: Record<string, string> = {
  HAPPY: '\uD83D\uDE0A',
  SAD: '\uD83D\uDE22',
  ANGRY: '\uD83D\uDE21',
  ANXIOUS: '\uD83D\uDE1F',
  NEUTRAL: '\uD83D\uDE10',
  EXCITED: '\uD83E\uDD29',
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function WelfarePage() {
  const schoolId = useAuthStore((s) => s.currentSchoolId);
  const [activeTab, setActiveTab] = useState('welfare');

  // --- Welfare state ---
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [welfareFormOpen, setWelfareFormOpen] = useState(false);

  // --- Health Records state ---
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [healthFormOpen, setHealthFormOpen] = useState(false);
  const [editHealthTarget, setEditHealthTarget] = useState<HealthRecord | null>(null);

  // --- Mood state ---
  const [moodFilter, setMoodFilter] = useState('');
  const [moodFormOpen, setMoodFormOpen] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const { data: classesRes } = useQuery({
    queryKey: ['classes', schoolId ?? ''],
    queryFn: () => getClasses(schoolId!),
    enabled: !!schoolId,
  });
  const classes = classesRes?.data ?? [];

  // Welfare
  const { data: welfareResponse, isLoading: welfareLoading } = useWelfareRecords({
    classId: classFilter || undefined,
    date: dateFilter ? format(dateFilter, 'yyyy-MM-dd') : undefined,
  });
  const welfareRecords = welfareResponse?.data ?? [];

  // Health Records
  const { data: healthResponse, isLoading: healthLoading } = useHealthRecords({
    recordType: typeFilter || undefined,
  });
  const healthRecords = healthResponse?.data ?? [];
  const filteredHealthRecords = severityFilter
    ? healthRecords.filter((r) => r.severity === severityFilter)
    : healthRecords;

  // Mood
  const { data: moodResponse, isLoading: moodLoading } = useMoodEntries();
  const moodEntries = moodResponse?.data ?? [];
  const filteredMoodEntries = moodFilter
    ? moodEntries.filter((e) => e.mood === moodFilter)
    : moodEntries;

  // ---------------------------------------------------------------------------
  // Column definitions
  // ---------------------------------------------------------------------------

  const welfareColumns: ColumnDef<WelfareRecord>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.studentName}</div>
      ),
    },
    {
      accessorKey: 'className',
      header: 'Class',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {row.original.notes || '\u2014'}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.date), 'MMM dd, yyyy'),
    },
    {
      accessorKey: 'recordedBy',
      header: 'Recorded By',
    },
  ];

  const healthColumns: ColumnDef<HealthRecord>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.studentName}</div>
      ),
    },
    {
      accessorKey: 'recordType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {recordTypeLabels[row.original.recordType] ?? row.original.recordType}
        </Badge>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => {
        const severity = row.original.severity;
        if (!severity) return <span className="text-muted-foreground">&mdash;</span>;
        return (
          <Badge
            variant="secondary"
            className={severityColors[severity] ?? ''}
          >
            {severity}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={
            row.original.isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-700'
          }
        >
          {row.original.isActive ? 'Active' : 'Resolved'}
        </Badge>
      ),
    },
    {
      accessorKey: 'recordedAt',
      header: 'Date',
      cell: ({ row }) =>
        format(new Date(row.original.recordedAt), 'MMM dd, yyyy'),
    },
    {
      accessorKey: 'recordedByName',
      header: 'Recorded By',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const record = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditHealthTarget(record)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const moodColumns: ColumnDef<MoodEntry>[] = [
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.studentName}</div>
      ),
    },
    {
      accessorKey: 'mood',
      header: 'Mood',
      cell: ({ row }) => {
        const mood = row.original.mood;
        return (
          <Badge
            variant="secondary"
            className={moodColors[mood] ?? 'bg-gray-100 text-gray-700'}
          >
            {moodEmojis[mood] ?? ''} {mood.charAt(0) + mood.slice(1).toLowerCase()}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'note',
      header: 'Note',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {row.original.note || '\u2014'}
        </span>
      ),
    },
    {
      accessorKey: 'recordedAt',
      header: 'Recorded At',
      cell: ({ row }) =>
        format(new Date(row.original.recordedAt), 'MMM dd, yyyy h:mm a'),
    },
    {
      accessorKey: 'recordedByName',
      header: 'Recorded By',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setHistoryStudent({
              id: row.original.studentId,
              name: row.original.studentName,
            })
          }
        >
          <History className="mr-1.5 h-4 w-4" />
          History
        </Button>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Wellness"
        description="Unified view of welfare logs, health records, and mood tracking."
        actions={
          <div className="flex items-center gap-2">
            {activeTab === 'welfare' && (
              <Button onClick={() => setWelfareFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Record Welfare
              </Button>
            )}
            {activeTab === 'health' && (
              <Button onClick={() => setHealthFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            )}
            {activeTab === 'mood' && (
              <Button onClick={() => setMoodFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Log Mood
              </Button>
            )}
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="welfare">Welfare Logs</TabsTrigger>
          <TabsTrigger value="health">Health Records</TabsTrigger>
          <TabsTrigger value="mood">Mood Tracker</TabsTrigger>
        </TabsList>

        {/* ---- Welfare Tab ---- */}
        <TabsContent value="welfare">
          <DataTable
            columns={welfareColumns}
            data={welfareRecords}
            isLoading={welfareLoading}
            searchKey="studentName"
            searchPlaceholder="Search students..."
            toolbarActions={
              <div className="flex items-center gap-2">
                <Select
                  value={classFilter}
                  onValueChange={(value) =>
                    setClassFilter(value === 'ALL' ? '' : value)
                  }
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDatePicker
                  value={dateFilter}
                  onChange={setDateFilter}
                  placeholder="Filter by date"
                />
              </div>
            }
          />
        </TabsContent>

        {/* ---- Health Records Tab ---- */}
        <TabsContent value="health">
          <DataTable
            columns={healthColumns}
            data={filteredHealthRecords}
            isLoading={healthLoading}
            searchKey="studentName"
            searchPlaceholder="Search students..."
            toolbarActions={
              <div className="flex items-center gap-2">
                <Select
                  value={typeFilter}
                  onValueChange={(value) =>
                    setTypeFilter(value === 'ALL' ? '' : value)
                  }
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    {RECORD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {recordTypeLabels[type] ?? type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={severityFilter}
                  onValueChange={(value) =>
                    setSeverityFilter(value === 'ALL' ? '' : value)
                  }
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="All Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Severity</SelectItem>
                    {SEVERITY_OPTIONS.map((sev) => (
                      <SelectItem key={sev} value={sev}>
                        {sev}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </TabsContent>

        {/* ---- Mood Tab ---- */}
        <TabsContent value="mood">
          <div className="space-y-4">
            <MoodCharts entries={moodEntries} />
            <DataTable
              columns={moodColumns}
              data={filteredMoodEntries}
              isLoading={moodLoading}
              searchKey="studentName"
              searchPlaceholder="Search students..."
              toolbarActions={
                <Select
                  value={moodFilter}
                  onValueChange={(value) =>
                    setMoodFilter(value === 'ALL' ? '' : value)
                  }
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="All Moods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Moods</SelectItem>
                    {MOOD_OPTIONS.map((mood) => (
                      <SelectItem key={mood} value={mood}>
                        {moodEmojis[mood]} {mood.charAt(0) + mood.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <WelfareFormDialog
        open={welfareFormOpen}
        onOpenChange={setWelfareFormOpen}
        classes={classes}
      />

      <HealthRecordFormDialog open={healthFormOpen} onOpenChange={setHealthFormOpen} />
      <HealthRecordFormDialog
        open={!!editHealthTarget}
        onOpenChange={(open) => {
          if (!open) setEditHealthTarget(null);
        }}
        record={editHealthTarget ?? undefined}
      />

      <MoodFormDialog open={moodFormOpen} onOpenChange={setMoodFormOpen} />

      <StudentMoodHistoryDialog
        open={!!historyStudent}
        onOpenChange={(open) => {
          if (!open) setHistoryStudent(null);
        }}
        studentId={historyStudent?.id ?? null}
        studentName={historyStudent?.name ?? ''}
      />
    </div>
  );
}
