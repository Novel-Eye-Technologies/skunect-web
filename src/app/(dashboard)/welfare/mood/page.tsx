'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { MoodFormDialog } from '@/components/features/welfare/mood-form-dialog';
import { useMoodEntries } from '@/lib/hooks/use-mood';
import type { MoodEntry } from '@/lib/types/mood';
import { MOOD_OPTIONS } from '@/lib/types/mood';

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

export default function MoodTrackerPage() {
  const [moodFilter, setMoodFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const { data: response, isLoading } = useMoodEntries();
  const entries = response?.data ?? [];

  const filteredEntries = moodFilter
    ? entries.filter((e) => e.mood === moodFilter)
    : entries;

  const columns: ColumnDef<MoodEntry>[] = [
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mood Tracker"
        description="Track and monitor student emotional well-being."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Mood
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filteredEntries}
        isLoading={isLoading}
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

      <MoodFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
