'use client';

import {
  GraduationCap,
  Users,
  ClipboardCheck,
  DollarSign,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/stat-card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ---------------------------------------------------------------------------
// Mock data - will be replaced with API calls
// ---------------------------------------------------------------------------

const stats = {
  totalStudents: 1_245,
  totalTeachers: 86,
  attendanceRate: 94.2,
  outstandingFees: 3_450_000,
};

const attendanceData = [
  { date: 'Mon', present: 1180, absent: 40, late: 25 },
  { date: 'Tue', present: 1195, absent: 30, late: 20 },
  { date: 'Wed', present: 1170, absent: 50, late: 25 },
  { date: 'Thu', present: 1200, absent: 25, late: 20 },
  { date: 'Fri', present: 1150, absent: 60, late: 35 },
];

const feeCollectionData = [
  { month: 'Sep', collected: 12_500_000, outstanding: 3_200_000 },
  { month: 'Oct', collected: 14_000_000, outstanding: 2_800_000 },
  { month: 'Nov', collected: 13_200_000, outstanding: 3_000_000 },
  { month: 'Dec', collected: 15_000_000, outstanding: 2_500_000 },
  { month: 'Jan', collected: 14_800_000, outstanding: 2_900_000 },
  { month: 'Feb', collected: 13_500_000, outstanding: 3_450_000 },
];

const recentActivity = [
  {
    id: '1',
    type: 'enrollment' as const,
    description: 'New student Adaobi Okafor enrolled in JSS 1A',
    timestamp: '2 hours ago',
    user: 'Admin',
  },
  {
    id: '2',
    type: 'attendance' as const,
    description: 'Attendance marked for 24 classes today',
    timestamp: '3 hours ago',
    user: 'System',
  },
  {
    id: '3',
    type: 'fee' as const,
    description: 'Payment of N150,000 received from Chinedu Eze',
    timestamp: '4 hours ago',
    user: 'Bursar',
  },
  {
    id: '4',
    type: 'grade' as const,
    description: 'CA1 scores uploaded for SS2 Mathematics',
    timestamp: '5 hours ago',
    user: 'Mr. Balogun',
  },
  {
    id: '5',
    type: 'announcement' as const,
    description: 'Mid-term break announcement published',
    timestamp: '6 hours ago',
    user: 'Admin',
  },
];

const activityTypeColors: Record<string, string> = {
  enrollment: 'bg-blue-100 text-blue-700',
  attendance: 'bg-emerald-100 text-emerald-700',
  fee: 'bg-amber-100 text-amber-700',
  grade: 'bg-purple-100 text-purple-700',
  announcement: 'bg-rose-100 text-rose-700',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          description="across all classes"
          icon={GraduationCap}
          trend={{ value: 3.2, direction: 'up' }}
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          description="active staff"
          icon={Users}
          trend={{ value: 1.5, direction: 'up' }}
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          description="this week"
          icon={ClipboardCheck}
          trend={{ value: 0.8, direction: 'up' }}
        />
        <StatCard
          title="Outstanding Fees"
          value={`₦${(stats.outstandingFees / 1_000_000).toFixed(1)}M`}
          description="pending collection"
          icon={DollarSign}
          trend={{ value: 2.1, direction: 'down' }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance</CardTitle>
            <CardDescription>
              Student attendance overview for this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="present"
                    stroke="#2A9D8F"
                    strokeWidth={2}
                    dot={{ fill: '#2A9D8F', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Present"
                  />
                  <Line
                    type="monotone"
                    dataKey="absent"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 4 }}
                    name="Absent"
                  />
                  <Line
                    type="monotone"
                    dataKey="late"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    name="Late"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fee Collection Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection</CardTitle>
            <CardDescription>
              Monthly fee collection vs outstanding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeCollectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) =>
                      `₦${(value / 1_000_000).toFixed(0)}M`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value) =>
                      `₦${(Number(value) / 1_000_000).toFixed(1)}M`
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="collected"
                    fill="#2A9D8F"
                    radius={[4, 4, 0, 0]}
                    name="Collected"
                  />
                  <Bar
                    dataKey="outstanding"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    name="Outstanding"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <Badge
                  variant="secondary"
                  className={`shrink-0 text-[10px] uppercase tracking-wider ${activityTypeColors[activity.type] ?? ''}`}
                >
                  {activity.type}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    {activity.description}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.user}</span>
                    <span aria-hidden="true">-</span>
                    <span>{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
