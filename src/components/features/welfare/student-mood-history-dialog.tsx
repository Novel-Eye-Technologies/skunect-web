'use client';

import { format, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentMoodHistory } from '@/lib/hooks/use-mood';
import { MOOD_OPTIONS } from '@/lib/types/mood';

const MOOD_LABELS: Record<string, string> = {
  HAPPY: 'Happy',
  SAD: 'Sad',
  ANGRY: 'Angry',
  ANXIOUS: 'Anxious',
  NEUTRAL: 'Neutral',
  EXCITED: 'Excited',
};

const MOOD_EMOJIS: Record<string, string> = {
  HAPPY: '\uD83D\uDE0A',
  SAD: '\uD83D\uDE22',
  ANGRY: '\uD83D\uDE21',
  ANXIOUS: '\uD83D\uDE1F',
  NEUTRAL: '\uD83D\uDE10',
  EXCITED: '\uD83E\uDD29',
};

const MOOD_BADGE_COLORS: Record<string, string> = {
  HAPPY: 'bg-emerald-100 text-emerald-700',
  SAD: 'bg-blue-100 text-blue-700',
  ANGRY: 'bg-red-100 text-red-700',
  ANXIOUS: 'bg-amber-100 text-amber-700',
  NEUTRAL: 'bg-gray-100 text-gray-700',
  EXCITED: 'bg-purple-100 text-purple-700',
};

// Map mood to a numeric value for charting
const MOOD_NUMERIC: Record<string, number> = {
  ANGRY: 1,
  SAD: 2,
  ANXIOUS: 3,
  NEUTRAL: 4,
  HAPPY: 5,
  EXCITED: 6,
};

interface StudentMoodHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string | null;
  studentName: string;
}

export function StudentMoodHistoryDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
}: StudentMoodHistoryDialogProps) {
  const { data: response, isLoading } = useStudentMoodHistory(
    open ? studentId : null
  );
  const entries = response?.data ?? [];

  // Build timeline data for chart (chronological)
  const chartData = entries
    .map((entry) => ({
      date: format(parseISO(entry.recordedAt), 'MMM dd'),
      value: MOOD_NUMERIC[entry.mood] ?? 4,
      mood: entry.mood,
      label: MOOD_LABELS[entry.mood] ?? entry.mood,
    }))
    .reverse(); // API returns newest first, reverse for chronological

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mood History - {studentName}</DialogTitle>
          <DialogDescription>
            Viewing mood records over time for this student.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No mood history found for this student.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mood over time chart */}
            {chartData.length >= 2 && (
              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 7]}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      tickFormatter={(value: number) => {
                        const mood = MOOD_OPTIONS.find(
                          (m) => MOOD_NUMERIC[m] === value
                        );
                        return mood ? MOOD_LABELS[mood] : '';
                      }}
                      width={60}
                    />
                    <Tooltip
                      formatter={(_value, _name, props) => [
                        (props?.payload as { label?: string })?.label ?? '',
                        'Mood',
                      ]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--popover)',
                        color: 'var(--popover-foreground)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-teal)"
                      fill="var(--color-teal)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'var(--color-teal)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Timeline list */}
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {MOOD_EMOJIS[entry.mood] ?? ''}
                    </span>
                    <div>
                      <Badge
                        variant="secondary"
                        className={
                          MOOD_BADGE_COLORS[entry.mood] ??
                          'bg-gray-100 text-gray-700'
                        }
                      >
                        {MOOD_LABELS[entry.mood] ?? entry.mood}
                      </Badge>
                      {entry.note && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {format(parseISO(entry.recordedAt), 'MMM dd, yyyy h:mm a')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
