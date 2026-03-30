'use client';

import { useMemo } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MoodEntry } from '@/lib/types/mood';
import { MOOD_OPTIONS } from '@/lib/types/mood';

const MOOD_CHART_COLORS: Record<string, string> = {
  HAPPY: '#10b981',
  SAD: '#3b82f6',
  ANGRY: '#ef4444',
  ANXIOUS: '#f59e0b',
  NEUTRAL: '#6b7280',
  EXCITED: '#a855f7',
};

const MOOD_LABELS: Record<string, string> = {
  HAPPY: 'Happy',
  SAD: 'Sad',
  ANGRY: 'Angry',
  ANXIOUS: 'Anxious',
  NEUTRAL: 'Neutral',
  EXCITED: 'Excited',
};

interface MoodChartsProps {
  entries: MoodEntry[];
}

export function MoodCharts({ entries }: MoodChartsProps) {
  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    }
    return MOOD_OPTIONS.filter((mood) => counts[mood])
      .map((mood) => ({
        mood: MOOD_LABELS[mood] ?? mood,
        moodKey: mood,
        count: counts[mood] ?? 0,
        color: MOOD_CHART_COLORS[mood] ?? '#6b7280',
      }));
  }, [entries]);

  const pieData = useMemo(() => {
    return distributionData.map((d) => ({
      name: d.mood,
      value: d.count,
      color: d.color,
    }));
  }, [distributionData]);

  const trendData = useMemo(() => {
    if (entries.length < 3) return [];

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    // Build properly sorted trend data from entries
    const entriesByDate = new Map<string, Record<string, number>>();
    for (const entry of entries) {
      const entryDate = parseISO(entry.recordedAt);
      if (entryDate < thirtyDaysAgo) continue;
      const dateKey = format(entryDate, 'yyyy-MM-dd');
      if (!entriesByDate.has(dateKey)) {
        entriesByDate.set(dateKey, {});
      }
      const dayMap = entriesByDate.get(dateKey)!;
      dayMap[entry.mood] = (dayMap[entry.mood] || 0) + 1;
    }

    const sortedDateKeys = Array.from(entriesByDate.keys()).sort();
    return sortedDateKeys.map((dateKey) => {
      const dayMap = entriesByDate.get(dateKey)!;
      return {
        date: format(parseISO(dateKey), 'MMM dd'),
        ...Object.fromEntries(
          MOOD_OPTIONS.map((mood) => [mood, dayMap[mood] ?? 0])
        ),
      };
    });
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Bar Chart - Mood Distribution */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Mood Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {distributionData.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No mood data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distributionData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="mood"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  formatter={(value) => [value, 'Count']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--popover)',
                    color: 'var(--popover-foreground)',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart - Mood Breakdown */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Mood Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--popover)',
                    color: 'var(--popover-foreground)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Area Chart - Mood Trend Over Time */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length < 2 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              Not enough data to show trend.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--popover)',
                    color: 'var(--popover-foreground)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {MOOD_OPTIONS.map((mood) => (
                  <Area
                    key={mood}
                    type="monotone"
                    dataKey={mood}
                    name={MOOD_LABELS[mood]}
                    stackId="1"
                    stroke={MOOD_CHART_COLORS[mood]}
                    fill={MOOD_CHART_COLORS[mood]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
