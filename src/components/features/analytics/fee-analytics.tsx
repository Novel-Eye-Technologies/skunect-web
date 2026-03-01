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
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Banknote, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/shared/stat-card';
import { useFeeSummary } from '@/lib/hooks/use-analytics';
import { formatCurrency, formatCurrencyShort } from '@/lib/utils/format-currency';

const STATUS_COLORS: Record<string, string> = {
  PAID: '#2A9D8F',
  PARTIAL: '#f59e0b',
  PENDING: '#1B2A4A',
  OVERDUE: '#ef4444',
};

export function FeeAnalytics() {
  const [sessionId, setSessionId] = useState('');

  const { data, isLoading } = useFeeSummary({
    sessionId: sessionId || undefined,
  });

  const monthlyCollection = data?.monthlyCollection ?? [];
  const statusBreakdown = data?.statusBreakdown ?? [];

  const pieData = statusBreakdown.map((item) => ({
    name: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
    value: item.count,
    amount: item.amount,
    color: STATUS_COLORS[item.status] ?? '#94a3b8',
  }));

  if (isLoading) {
    return <FeeAnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="fee-session">Session ID</Label>
            <Input
              id="fee-session"
              type="text"
              placeholder="e.g. 2025/2026"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Collection Rate"
          value={`${(data?.paymentRate ?? 0).toFixed(1)}%`}
          icon={TrendingUp}
          description="Of total invoiced"
        />
        <StatCard
          title="Total Collected"
          value={formatCurrencyShort(data?.totalCollected ?? 0)}
          icon={CheckCircle2}
          description={formatCurrency(data?.totalCollected ?? 0)}
        />
        <StatCard
          title="Total Outstanding"
          value={formatCurrencyShort(data?.totalOutstanding ?? 0)}
          icon={AlertTriangle}
          description={formatCurrency(data?.totalOutstanding ?? 0)}
        />
        <StatCard
          title="Total Invoiced"
          value={formatCurrencyShort(data?.totalInvoiced ?? 0)}
          icon={Banknote}
          description={formatCurrency(data?.totalInvoiced ?? 0)}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart - Monthly Collection vs Outstanding */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Monthly Collection vs Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyCollection.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No monthly collection data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyCollection}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    tickFormatter={(value) => formatCurrencyShort(value)}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Bar
                    dataKey="collected"
                    name="Collected"
                    fill="#2A9D8F"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="outstanding"
                    name="Outstanding"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Fee Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 || pieData.every((d) => d.value === 0) ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No fee status data available.
              </div>
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
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
                      formatter={(value, name, props) => {
                        const item = props.payload as Record<string, number>;
                        return [
                          `${value} invoices (${formatCurrency(item.amount)})`,
                          name,
                        ];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="mt-2 flex flex-wrap justify-center gap-4">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FeeAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[380px] rounded-lg lg:col-span-2" />
        <Skeleton className="h-[380px] rounded-lg" />
      </div>
    </div>
  );
}
