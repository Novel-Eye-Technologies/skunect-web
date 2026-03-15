'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Calculator, ArrowUpCircle, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
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
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  getMySubscription,
  getMySubscriptionPayments,
  calculateMyProration,
  requestUpgrade,
  downloadMyPaymentReceipt,
} from '@/lib/api/subscription';
import type {
  SchoolSubscription,
  SubscriptionPayment,
  ProrateCalculation,
} from '@/lib/types/subscription';

export default function AdminSubscriptionPage() {
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);
  const subscriptionStatus = useAuthStore((s) => s.subscriptionStatus);

  const [subscription, setSubscription] = useState<SchoolSubscription | null>(null);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [prorateDialogOpen, setProrateDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Proration
  const [additionalStudents, setAdditionalStudents] = useState(10);
  const [prorateResult, setProrateResult] = useState<ProrateCalculation | null>(null);

  // Upgrade
  const [upgradeStudents, setUpgradeStudents] = useState<number | undefined>();
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const fetchData = useCallback(async () => {
    if (!currentSchoolId) return;
    setLoading(true);
    try {
      const [subRes, payRes] = await Promise.allSettled([
        getMySubscription(currentSchoolId),
        getMySubscriptionPayments(currentSchoolId),
      ]);

      if (subRes.status === 'fulfilled' && subRes.value.status === 'SUCCESS') {
        setSubscription(subRes.value.data);
      }
      if (payRes.status === 'fulfilled' && payRes.value.status === 'SUCCESS') {
        // Backend returns paginated response ({ content: [] }), but API type says array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payData = payRes.value.data as any;
        setPayments(Array.isArray(payData) ? payData : payData?.content ?? []);
      }
    } catch { /* ignore */ }
    finally {
      setLoading(false);
    }
  }, [currentSchoolId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCalculateProration = async () => {
    if (!currentSchoolId) return;
    try {
      const response = await calculateMyProration(currentSchoolId, additionalStudents);
      if (response.status === 'SUCCESS') setProrateResult(response.data);
    } catch {
      toast.error('Failed to calculate proration');
    }
  };

  const handleRequestUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchoolId) return;
    setSaving(true);
    try {
      const response = await requestUpgrade(currentSchoolId, {
        additionalStudents: upgradeStudents,
        message: upgradeMessage,
      });
      if (response.status === 'SUCCESS') {
        toast.success('Upgrade request submitted');
        setUpgradeDialogOpen(false);
      }
    } catch {
      toast.error('Failed to submit upgrade request');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    if (!currentSchoolId) return;
    try {
      const blob = await downloadMyPaymentReceipt(currentSchoolId, paymentId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download receipt');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription"
        description="View your school's subscription status"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setProrateDialogOpen(true)}>
              <Calculator className="mr-2 h-4 w-4" />
              Proration Calculator
            </Button>
            <Button onClick={() => setUpgradeDialogOpen(true)}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Request Upgrade
            </Button>
          </div>
        }
      />

      {/* Grace Period Warning */}
      {(subscriptionStatus === 'GRACE_PERIOD' || subscription?.status === 'GRACE_PERIOD') && (
        <Alert variant="destructive">
          <AlertTitle>Subscription Grace Period</AlertTitle>
          <AlertDescription>
            Your school&apos;s subscription has expired. You have {subscription?.gracePeriodDays ?? 14} days
            to renew before the school is deactivated. Please contact support to renew.
          </AlertDescription>
        </Alert>
      )}

      {subscription ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Status" value={subscription.status.replace('_', ' ')} />
            <StatCard title="Students" value={`${subscription.activeStudentCount} / ${subscription.studentLimit}`} />
            <StatCard title="Days Until Expiry" value={subscription.daysUntilExpiry.toString()} />
            <StatCard title="Outstanding" value={formatCurrency(subscription.outstandingBalance)} />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Student Usage</CardTitle></CardHeader>
            <CardContent>
              <Progress value={subscription.studentUsagePercent} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {subscription.studentUsagePercent}% ({subscription.activeStudentCount} of {subscription.studentLimit})
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Subscription Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{subscription.planName}</dd></div>
                <div><dt className="text-muted-foreground">Tier</dt><dd><Badge variant={subscription.planTier === 'PREMIUM' ? 'default' : 'secondary'}>{subscription.planTier}</Badge></dd></div>
                <div><dt className="text-muted-foreground">Start Date</dt><dd>{subscription.startDate}</dd></div>
                <div><dt className="text-muted-foreground">End Date</dt><dd>{subscription.endDate}</dd></div>
                <div><dt className="text-muted-foreground">Total Amount</dt><dd>{formatCurrency(subscription.totalAmount)}</dd></div>
                <div><dt className="text-muted-foreground">Amount Paid</dt><dd>{formatCurrency(subscription.amountPaid)}</dd></div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No payments recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>{formatCurrency(p.amount)}</TableCell>
                        <TableCell><Badge variant="outline">{p.paymentType}</Badge></TableCell>
                        <TableCell>{p.paymentMethod?.replace('_', ' ') ?? '—'}</TableCell>
                        <TableCell>{p.paymentReference ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleDownloadReceipt(p.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No active subscription found for your school.</p>
            <p className="text-sm text-muted-foreground mt-2">Please contact the platform administrator.</p>
          </CardContent>
        </Card>
      )}

      {/* Proration Calculator */}
      <Dialog open={prorateDialogOpen} onOpenChange={setProrateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Proration Calculator</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-2">
                <Label>Additional Students</Label>
                <Input type="number" min={1} value={additionalStudents} onChange={(e) => setAdditionalStudents(parseInt(e.target.value) || 1)} />
              </div>
              <Button onClick={handleCalculateProration}>Calculate</Button>
            </div>
            {prorateResult && (
              <Card>
                <CardContent className="pt-4 text-sm space-y-2">
                  <p><strong>Additional Students:</strong> {prorateResult.additionalStudents}</p>
                  <p><strong>Remaining Months:</strong> {prorateResult.remainingMonths}</p>
                  <p><strong>Monthly Rate/Student:</strong> {formatCurrency(prorateResult.monthlyRatePerStudent)}</p>
                  <p className="text-lg font-bold">Prorated Amount: {formatCurrency(prorateResult.proratedAmount)}</p>
                  <p className="text-xs text-muted-foreground">{prorateResult.breakdown}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Request */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Request Upgrade</DialogTitle></DialogHeader>
          <form onSubmit={handleRequestUpgrade} className="space-y-4">
            <div className="space-y-2">
              <Label>Additional Students Needed</Label>
              <Input type="number" min={1} value={upgradeStudents ?? ''} onChange={(e) => setUpgradeStudents(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={upgradeMessage} onChange={(e) => setUpgradeMessage(e.target.value)} placeholder="Describe your upgrade needs..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Submitting...' : 'Submit Request'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
