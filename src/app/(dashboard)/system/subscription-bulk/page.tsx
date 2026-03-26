'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, CalendarPlus } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getSubscriptionDashboard,
  getActiveSubscriptionPlans,
  bulkExtendSubscriptions,
  bulkRenewSubscriptions,
} from '@/lib/api/subscription';
import type {
  SchoolSubscription,
  SubscriptionPlan,
  BulkOperationResponse,
} from '@/lib/types/subscription';

export default function BulkSubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<SchoolSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<Set<string>>(new Set());

  // Dialogs
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [operationResult, setOperationResult] = useState<BulkOperationResponse | null>(null);

  // Extend form
  const [extendDate, setExtendDate] = useState('');
  const [extendNotes, setExtendNotes] = useState('');

  // Renew form
  const [renewPlanId, setRenewPlanId] = useState('');
  const [renewStartDate, setRenewStartDate] = useState('');
  const [renewEndDate, setRenewEndDate] = useState('');
  const [renewStudentLimit, setRenewStudentLimit] = useState<number | undefined>();
  const [renewNotes, setRenewNotes] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, plansRes] = await Promise.allSettled([
        getSubscriptionDashboard(),
        getActiveSubscriptionPlans(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.status === 'SUCCESS') {
        // Combine expiring and grace period schools as the actionable list
        const allSubs = [
          ...dashRes.value.data.expiringWithin30Days,
          ...dashRes.value.data.inGracePeriod,
        ];
        // Deduplicate by ID
        const uniqueSubs = allSubs.filter(
          (sub, idx, arr) => arr.findIndex((s) => s.id === sub.id) === idx
        );
        setSubscriptions(uniqueSubs);
      }

      if (plansRes.status === 'fulfilled' && plansRes.value.status === 'SUCCESS') {
        setPlans(plansRes.value.data);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSchool = (schoolId: string) => {
    setSelectedSchoolIds((prev) => {
      const next = new Set(prev);
      if (next.has(schoolId)) {
        next.delete(schoolId);
      } else {
        next.add(schoolId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedSchoolIds.size === subscriptions.length) {
      setSelectedSchoolIds(new Set());
    } else {
      setSelectedSchoolIds(new Set(subscriptions.map((s) => s.schoolId)));
    }
  };

  const handleExtend = async () => {
    if (selectedSchoolIds.size === 0 || !extendDate) return;
    setSaving(true);
    try {
      const response = await bulkExtendSubscriptions({
        schoolIds: Array.from(selectedSchoolIds),
        newEndDate: extendDate,
        notes: extendNotes || undefined,
      });
      if (response.status === 'SUCCESS') {
        setOperationResult(response.data);
        setExtendDialogOpen(false);
        setResultDialogOpen(true);
        fetchData();
      }
    } catch {
      toast.error('Bulk extend failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRenew = async () => {
    if (selectedSchoolIds.size === 0 || !renewPlanId || !renewStartDate || !renewEndDate) return;
    setSaving(true);
    try {
      const response = await bulkRenewSubscriptions({
        schoolIds: Array.from(selectedSchoolIds),
        planId: renewPlanId,
        startDate: renewStartDate,
        endDate: renewEndDate,
        studentLimit: renewStudentLimit,
        notes: renewNotes || undefined,
      });
      if (response.status === 'SUCCESS') {
        setOperationResult(response.data);
        setRenewDialogOpen(false);
        setResultDialogOpen(true);
        fetchData();
        setSelectedSchoolIds(new Set());
      }
    } catch {
      toast.error('Bulk renew failed');
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Subscription Management"
        description="Extend or renew subscriptions for multiple schools at once"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={selectedSchoolIds.size === 0}
              onClick={() => setExtendDialogOpen(true)}
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Extend Selected ({selectedSchoolIds.size})
            </Button>
            <Button
              disabled={selectedSchoolIds.size === 0}
              onClick={() => setRenewDialogOpen(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Renew Selected ({selectedSchoolIds.size})
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Schools Requiring Attention ({subscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedSchoolIds.size === subscriptions.length && subscriptions.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
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
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No subscriptions requiring attention
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSchoolIds.has(sub.schoolId)}
                        onCheckedChange={() => toggleSchool(sub.schoolId)}
                      />
                    </TableCell>
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
                      <span className={(sub.daysUntilExpiry ?? 0) <= 7 ? 'text-destructive font-bold' : ''}>
                        {sub.daysUntilExpiry ?? 0} days
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(sub.outstandingBalance)}</TableCell>
                    <TableCell>{sub.activeStudentCount} / {sub.studentLimit}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Extend Dialog */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Extend Subscriptions ({selectedSchoolIds.size} schools)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New End Date</Label>
              <Input
                type="date"
                value={extendDate}
                onChange={(e) => setExtendDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={extendNotes}
                onChange={(e) => setExtendNotes(e.target.value)}
                placeholder="Reason for extension..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleExtend} disabled={saving || !extendDate}>
              {saving ? 'Extending...' : 'Extend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renew Dialog */}
      <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Renew Subscriptions ({selectedSchoolIds.size} schools)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={renewPlanId} onValueChange={setRenewPlanId}>
                <SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.tier}) — {formatCurrency(p.pricePerStudent)}/student
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={renewStartDate} onChange={(e) => setRenewStartDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={renewEndDate} onChange={(e) => setRenewEndDate(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Student Limit (optional, defaults to plan max)</Label>
              <Input
                type="number"
                min={1}
                value={renewStudentLimit ?? ''}
                onChange={(e) => setRenewStudentLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Leave empty for plan default"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea value={renewNotes} onChange={(e) => setRenewNotes(e.target.value)} placeholder="Renewal notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRenew} disabled={saving || !renewPlanId || !renewStartDate || !renewEndDate}>
              {saving ? 'Renewing...' : 'Renew'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Operation Results</DialogTitle>
          </DialogHeader>
          {operationResult && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <span>Total: {operationResult.totalRequested}</span>
                <span className="text-green-600">Success: {operationResult.successCount}</span>
                {operationResult.failureCount > 0 && (
                  <span className="text-destructive">Failed: {operationResult.failureCount}</span>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {operationResult.results.map((r) => (
                  <div key={r.schoolId} className="flex items-center justify-between text-sm border-b pb-2">
                    <span className="font-medium">{r.schoolName}</span>
                    <span className={r.success ? 'text-green-600' : 'text-destructive'}>
                      {r.success ? r.message : r.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setResultDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
