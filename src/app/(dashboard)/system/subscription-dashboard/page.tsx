'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getSubscriptionDashboard } from '@/lib/api/subscription';
import type { SubscriptionDashboard } from '@/lib/types/subscription';

export default function SubscriptionDashboardPage() {
  const [dashboard, setDashboard] = useState<SubscriptionDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await getSubscriptionDashboard();
      if (response.status === 'SUCCESS') {
        setDashboard(response.data);
      }
    } catch {
      toast.error('Failed to load subscription dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  const statusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default' as const;
      case 'GRACE_PERIOD': return 'secondary' as const;
      case 'EXPIRED': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Dashboard"
        description="Revenue metrics and subscription overview across all schools"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Active"
          value={dashboard.totalActiveSubscriptions.toString()}
          icon={Activity}
        />
        <StatCard
          title="Grace Period"
          value={dashboard.totalGracePeriodSubscriptions.toString()}
          icon={AlertTriangle}
        />
        <StatCard
          title="Expired"
          value={dashboard.totalExpiredSubscriptions.toString()}
          icon={Clock}
        />
        <StatCard
          title="Pending"
          value={dashboard.totalPendingSubscriptions.toString()}
          icon={Users}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboard.totalRevenue)}
          icon={TrendingUp}
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(dashboard.totalOutstanding)}
          icon={DollarSign}
        />
      </div>

      {/* Grace Period Schools */}
      {dashboard.inGracePeriod.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Schools in Grace Period ({dashboard.inGracePeriod.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Grace Days</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.inGracePeriod.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.schoolName}</TableCell>
                    <TableCell>
                      <Badge variant={sub.planTier === 'PREMIUM' ? 'default' : 'secondary'}>
                        {sub.planName}
                      </Badge>
                    </TableCell>
                    <TableCell>{sub.endDate}</TableCell>
                    <TableCell>{sub.gracePeriodDays} days</TableCell>
                    <TableCell className="text-destructive font-medium">
                      {formatCurrency(sub.outstandingBalance)}
                    </TableCell>
                    <TableCell>{sub.activeStudentCount} / {sub.studentLimit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Expiring Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            Expiring Within 30 Days ({dashboard.expiringWithin30Days.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.expiringWithin30Days.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No subscriptions expiring within 30 days
                  </TableCell>
                </TableRow>
              ) : (
                dashboard.expiringWithin30Days.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.schoolName}</TableCell>
                    <TableCell>
                      <Badge variant={sub.planTier === 'PREMIUM' ? 'default' : 'secondary'}>
                        {sub.planName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(sub.status)}>
                        {sub.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{sub.endDate}</TableCell>
                    <TableCell>
                      <span className={(sub.daysUntilExpiry ?? 0) <= 7 ? 'text-destructive font-bold' : (sub.daysUntilExpiry ?? 0) <= 14 ? 'text-yellow-600 font-medium' : ''}>
                        {sub.daysUntilExpiry ?? 0} days
                      </span>
                    </TableCell>
                    <TableCell>
                      {sub.outstandingBalance > 0 ? (
                        <span className="text-destructive">{formatCurrency(sub.outstandingBalance)}</span>
                      ) : (
                        <span className="text-green-600">Paid</span>
                      )}
                    </TableCell>
                    <TableCell>{sub.activeStudentCount} / {sub.studentLimit}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
