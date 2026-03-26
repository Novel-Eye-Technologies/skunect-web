'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, CreditCard, Calculator, Download } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  getSchoolSubscription,
  createSchoolSubscription,
  cancelSchoolSubscription,
  recordSubscriptionPayment,
  getSubscriptionPayments,
  calculateProration,
  getActiveSubscriptionPlans,
  downloadPaymentReceipt,
} from '@/lib/api/subscription';
import type {
  SchoolSubscription,
  SubscriptionPayment,
  SubscriptionPlan,
  ProrateCalculation,
  CreateSchoolSubscriptionRequest,
  RecordPaymentRequest,
  PaymentType,
  PaymentMethod,
} from '@/lib/types/subscription';

export function SchoolSubscriptionClient() {
  const params = useParams<{ schoolId: string }>();
  const pathname = usePathname();

  // In a static export, useParams() may return the placeholder '_' from
  // generateStaticParams.  Extract the real ID from the URL in that case.
  const rawSchoolId = params.schoolId;
  const schoolId =
    !rawSchoolId || rawSchoolId === '_'
      ? pathname.split('/').filter(Boolean).at(-2) ?? rawSchoolId
      : rawSchoolId;

  const [subscription, setSubscription] = useState<SchoolSubscription | null>(null);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [noSubscription, setNoSubscription] = useState(false);

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [prorateDialogOpen, setProrateDialogOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [saving, setSaving] = useState(false);

  // Proration
  const [additionalStudents, setAdditionalStudents] = useState(10);
  const [prorateResult, setProrateResult] = useState<ProrateCalculation | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState<CreateSchoolSubscriptionRequest>({
    planId: '',
    startDate: '',
    endDate: '',
    studentLimit: 100,
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState<RecordPaymentRequest>({
    amount: 0,
    paymentType: 'FULL',
    paymentMethod: 'BANK_TRANSFER',
    paymentReference: '',
    description: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, payRes] = await Promise.allSettled([
        getSchoolSubscription(schoolId),
        getSubscriptionPayments(schoolId),
      ]);

      if (subRes.status === 'fulfilled' && subRes.value.status === 'SUCCESS') {
        setSubscription(subRes.value.data);
        setNoSubscription(false);
      } else {
        setNoSubscription(true);
      }

      if (payRes.status === 'fulfilled' && payRes.value.status === 'SUCCESS') {
        // Backend returns paginated response ({ content: [] }), but API type says array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payData = payRes.value.data as any;
        setPayments(Array.isArray(payData) ? payData : payData?.content ?? []);
      }
    } catch {
      setNoSubscription(true);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await getActiveSubscriptionPlans();
      if (response.status === 'SUCCESS') setPlans(response.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchData();
    fetchPlans();
  }, [fetchData, fetchPlans]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await createSchoolSubscription(schoolId, createForm);
      if (response.status === 'SUCCESS') {
        toast.success('Subscription created');
        setCreateDialogOpen(false);
        fetchData();
      }
    } catch {
      toast.error('Failed to create subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await recordSubscriptionPayment(schoolId, paymentForm);
      if (response.status === 'SUCCESS') {
        toast.success('Payment recorded');
        setPaymentDialogOpen(false);
        fetchData();
      }
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  const handleCalculateProration = async () => {
    try {
      const response = await calculateProration(schoolId, additionalStudents);
      if (response.status === 'SUCCESS') {
        setProrateResult(response.data);
      }
    } catch {
      toast.error('Failed to calculate proration');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSchoolSubscription(schoolId);
      toast.success('Subscription cancelled');
      setConfirmCancel(false);
      fetchData();
    } catch {
      toast.error('Failed to cancel subscription');
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const blob = await downloadPaymentReceipt(schoolId, paymentId);
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

  const statusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'GRACE_PERIOD': return 'secondary';
      case 'EXPIRED': return 'destructive';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Subscription"
        description={`Manage subscription for school ${schoolId}`}
        actions={
          noSubscription ? (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Subscription
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
              <Button variant="outline" onClick={() => setProrateDialogOpen(true)}>
                <Calculator className="mr-2 h-4 w-4" />
                Proration Calculator
              </Button>
              <Button variant="destructive" onClick={() => setConfirmCancel(true)}>
                Cancel Subscription
              </Button>
            </div>
          )
        }
      />

      {/* Grace Period Warning */}
      {subscription?.status === 'GRACE_PERIOD' && (
        <Alert variant="destructive">
          <AlertTitle>Grace Period Active</AlertTitle>
          <AlertDescription>
            This school&apos;s subscription has expired and is in a {subscription.gracePeriodDays}-day
            grace period. The school will be deactivated if not renewed.
          </AlertDescription>
        </Alert>
      )}

      {subscription && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Status"
              value={subscription.status.replace('_', ' ')}
            />
            <StatCard
              title="Students"
              value={`${subscription.activeStudentCount} / ${subscription.studentLimit}`}
            />
            <StatCard
              title="Amount Paid"
              value={formatCurrency(subscription.amountPaid)}
            />
            <StatCard
              title="Days Until Expiry"
              value={(subscription.daysUntilExpiry ?? 0).toString()}
            />
          </div>

          {/* Usage Bar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={subscription.studentUsagePercent} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {subscription.studentUsagePercent}% ({subscription.activeStudentCount} of {subscription.studentLimit} students)
              </p>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{subscription.planName}</dd></div>
                <div><dt className="text-muted-foreground">Tier</dt><dd><Badge variant={subscription.planTier === 'PREMIUM' ? 'default' : 'secondary'}>{subscription.planTier}</Badge></dd></div>
                <div><dt className="text-muted-foreground">Start Date</dt><dd>{subscription.startDate}</dd></div>
                <div><dt className="text-muted-foreground">End Date</dt><dd>{subscription.endDate}</dd></div>
                <div><dt className="text-muted-foreground">Total Amount</dt><dd>{formatCurrency(subscription.totalAmount)}</dd></div>
                <div><dt className="text-muted-foreground">Outstanding</dt><dd className={subscription.outstandingBalance > 0 ? 'text-destructive font-medium' : ''}>{formatCurrency(subscription.outstandingBalance)}</dd></div>
                <div><dt className="text-muted-foreground">Grace Period</dt><dd>{subscription.gracePeriodDays} days</dd></div>
                <div><dt className="text-muted-foreground">Auto Renew</dt><dd>{subscription.isAutoRenew ? 'Yes' : 'No'}</dd></div>
              </dl>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No payments recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>{formatCurrency(p.amount)}</TableCell>
                        <TableCell><Badge variant="outline">{p.paymentType}</Badge></TableCell>
                        <TableCell>{p.paymentMethod ?? '—'}</TableCell>
                        <TableCell>{p.paymentReference ?? '—'}</TableCell>
                        <TableCell>{p.recordedByName ?? '—'}</TableCell>
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
      )}

      {noSubscription && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No active subscription for this school.</p>
            <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Subscription Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Create Subscription</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={createForm.planId} onValueChange={(v) => setCreateForm({ ...createForm, planId: v })}>
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
                <Input type="date" value={createForm.startDate} onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={createForm.endDate} onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Student Limit</Label>
              <Input type="number" min={1} value={createForm.studentLimit} onChange={(e) => setCreateForm({ ...createForm, studentLimit: parseInt(e.target.value) || 100 })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" min={1} step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })} required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={paymentForm.paymentType} onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentType: v as PaymentType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['FULL', 'PARTIAL', 'PRORATED', 'UPGRADE', 'RENEWAL'].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={paymentForm.paymentMethod ?? ''} onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMethod: v as PaymentMethod })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['BANK_TRANSFER', 'CARD', 'CASH'].map((m) => (
                      <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input value={paymentForm.paymentReference ?? ''} onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })} placeholder="e.g. TXN12345" />
              </div>
            </div>
            {paymentForm.paymentType === 'PRORATED' && (
              <div className="space-y-2">
                <Label>Students Added</Label>
                <Input type="number" min={0} value={paymentForm.studentsAdded ?? 0} onChange={(e) => setPaymentForm({ ...paymentForm, studentsAdded: parseInt(e.target.value) || 0 })} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={paymentForm.description ?? ''} onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Recording...' : 'Record Payment'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Proration Calculator Dialog */}
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
                  <p className="text-lg font-bold"><strong>Prorated Amount:</strong> {formatCurrency(prorateResult.proratedAmount)}</p>
                  <p className="text-xs text-muted-foreground">{prorateResult.breakdown}</p>
                  <p><strong>New Student Limit:</strong> {prorateResult.newStudentLimit}</p>
                  <p><strong>New Total Amount:</strong> {formatCurrency(prorateResult.newTotalAmount)}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel Subscription?"
        description="This will cancel the school's current subscription. The school will lose access once the current period ends."
        confirmLabel="Cancel Subscription"
        variant="destructive"
        onConfirm={handleCancel}
      />
    </div>
  );
}
