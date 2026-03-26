'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Ban } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deactivateSubscriptionPlan,
} from '@/lib/api/subscription';
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  SubscriptionTier,
} from '@/lib/types/subscription';

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CreateSubscriptionPlanRequest>({
    name: '',
    tier: 'STANDARD',
    pricePerStudent: 0,
    billingPeriodMonths: 12,
    maxStudents: null,
    isTrial: false,
    trialDurationDays: undefined,
  });

  const fetchPlans = useCallback(async () => {
    try {
      const response = await getSubscriptionPlans();
      if (response.status === 'SUCCESS') {
        setPlans(response.data);
      }
    } catch {
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openCreateDialog = () => {
    setEditingPlan(null);
    setForm({
      name: '',
      tier: 'STANDARD',
      pricePerStudent: 0,
      billingPeriodMonths: 12,
      maxStudents: null,
      isTrial: false,
      trialDurationDays: undefined,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      tier: plan.tier as SubscriptionTier,
      pricePerStudent: plan.pricePerStudent,
      billingPeriodMonths: plan.billingPeriodMonths,
      maxStudents: plan.maxStudents,
      isTrial: plan.isTrial,
      trialDurationDays: plan.trialDurationDays ?? undefined,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPlan) {
        const response = await updateSubscriptionPlan(editingPlan.id, form);
        if (response.status === 'SUCCESS') {
          toast.success('Plan updated');
          setDialogOpen(false);
          fetchPlans();
        }
      } else {
        const response = await createSubscriptionPlan(form);
        if (response.status === 'SUCCESS') {
          toast.success('Plan created');
          setDialogOpen(false);
          fetchPlans();
        }
      }
    } catch {
      toast.error('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivate) return;
    try {
      await deactivateSubscriptionPlan(confirmDeactivate.id);
      toast.success('Plan deactivated');
      setConfirmDeactivate(null);
      fetchPlans();
    } catch {
      toast.error('Failed to deactivate plan');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Plans"
        description="Manage subscription plans for schools"
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Price/Student</TableHead>
                <TableHead>Billing Period</TableHead>
                <TableHead>Max Students</TableHead>
                <TableHead>Trial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No subscription plans yet
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      <Badge variant={plan.tier === 'PREMIUM' ? 'default' : 'secondary'}>
                        {plan.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(plan.pricePerStudent)}</TableCell>
                    <TableCell>{plan.billingPeriodMonths} months</TableCell>
                    <TableCell>{plan.maxStudents ?? 'Unlimited'}</TableCell>
                    <TableCell>
                      {plan.isTrial ? (
                        <Badge variant="outline">{plan.trialDurationDays} days</Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.isActive ? 'default' : 'destructive'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(plan)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {plan.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmDeactivate(plan)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Standard Annual"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select
                  value={form.tier}
                  onValueChange={(v) => setForm({ ...form, tier: v as SubscriptionTier })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Student</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.pricePerStudent}
                  onChange={(e) => setForm({ ...form, pricePerStudent: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing">Billing Period (months)</Label>
                <Input
                  id="billing"
                  type="number"
                  min={1}
                  value={form.billingPeriodMonths ?? 12}
                  onChange={(e) => setForm({ ...form, billingPeriodMonths: parseInt(e.target.value) || 12 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min={0}
                  value={form.maxStudents ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, maxStudents: e.target.value ? parseInt(e.target.value) : null })
                  }
                  placeholder="Unlimited"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isTrial ?? false}
                  onChange={(e) => setForm({ ...form, isTrial: e.target.checked })}
                />
                Trial Plan
              </label>
              {form.isTrial && (
                <div className="space-y-2">
                  <Label htmlFor="trialDays">Trial Duration (days)</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    min={1}
                    value={form.trialDurationDays ?? ''}
                    onChange={(e) => setForm({ ...form, trialDurationDays: parseInt(e.target.value) || undefined })}
                    className="w-28"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingPlan ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        open={!!confirmDeactivate}
        onOpenChange={(open) => !open && setConfirmDeactivate(null)}
        title="Deactivate Plan?"
        description={`Are you sure you want to deactivate "${confirmDeactivate?.name}"? Schools with active subscriptions using this plan will not be affected, but no new subscriptions can use this plan.`}
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
