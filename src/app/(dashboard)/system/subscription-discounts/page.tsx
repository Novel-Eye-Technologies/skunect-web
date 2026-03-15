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
  getSubscriptionDiscounts,
  createDiscount,
  updateDiscount,
  deactivateDiscount,
} from '@/lib/api/subscription';
import type {
  SubscriptionDiscount,
  CreateDiscountRequest,
  DiscountType,
} from '@/lib/types/subscription';

export default function SubscriptionDiscountsPage() {
  const [discounts, setDiscounts] = useState<SubscriptionDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionDiscount | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<SubscriptionDiscount | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CreateDiscountRequest>({
    code: '',
    name: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    validFrom: '',
  });

  const fetchDiscounts = useCallback(async () => {
    try {
      const response = await getSubscriptionDiscounts();
      if (response.status === 'SUCCESS') {
        setDiscounts(response.data);
      }
    } catch {
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const openCreateDialog = () => {
    setEditing(null);
    setForm({
      code: '',
      name: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      validFrom: new Date().toISOString().split('T')[0],
    });
    setDialogOpen(true);
  };

  const openEditDialog = (discount: SubscriptionDiscount) => {
    setEditing(discount);
    setForm({
      code: discount.code,
      name: discount.name,
      description: discount.description ?? undefined,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      maxUses: discount.maxUses ?? undefined,
      validFrom: discount.validFrom,
      validUntil: discount.validUntil ?? undefined,
      applicableTiers: discount.applicableTiers ?? undefined,
      minStudents: discount.minStudents ?? undefined,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const response = await updateDiscount(editing.id, {
          name: form.name,
          description: form.description,
          discountValue: form.discountValue,
          maxUses: form.maxUses,
          validUntil: form.validUntil,
          applicableTiers: form.applicableTiers,
          minStudents: form.minStudents,
        });
        if (response.status === 'SUCCESS') {
          toast.success('Discount updated');
          setDialogOpen(false);
          fetchDiscounts();
        }
      } else {
        const response = await createDiscount(form);
        if (response.status === 'SUCCESS') {
          toast.success('Discount created');
          setDialogOpen(false);
          fetchDiscounts();
        }
      }
    } catch {
      toast.error('Failed to save discount');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivate) return;
    try {
      await deactivateDiscount(confirmDeactivate.id);
      toast.success('Discount deactivated');
      setConfirmDeactivate(null);
      fetchDiscounts();
    } catch {
      toast.error('Failed to deactivate discount');
    }
  };

  const formatValue = (discount: SubscriptionDiscount) => {
    if (discount.discountType === 'PERCENTAGE') {
      return `${discount.discountValue}%`;
    }
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(discount.discountValue);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Discounts"
        description="Manage discount codes for school subscriptions"
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Discount
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid From</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : discounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No discount codes yet
                  </TableCell>
                </TableRow>
              ) : (
                discounts.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-medium">{d.code}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{d.discountType.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>{formatValue(d)}</TableCell>
                    <TableCell>
                      {d.currentUses}{d.maxUses ? ` / ${d.maxUses}` : ''}
                    </TableCell>
                    <TableCell>{d.validFrom}</TableCell>
                    <TableCell>{d.validUntil ?? 'No expiry'}</TableCell>
                    <TableCell>
                      <Badge variant={d.isActive ? 'default' : 'destructive'}>
                        {d.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(d)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {d.isActive && (
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDeactivate(d)}>
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
            <DialogTitle>{editing ? 'Edit Discount' : 'Create Discount'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. WELCOME20"
                  disabled={!!editing}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Welcome Discount"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select
                  value={form.discountType}
                  onValueChange={(v) => setForm({ ...form, discountType: v as DiscountType })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{form.discountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (NGN)'}</Label>
                <Input
                  type="number"
                  min={0}
                  step={form.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                  max={form.discountType === 'PERCENTAGE' ? 100 : undefined}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Valid From</Label>
                <Input
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={form.validUntil ?? ''}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value || undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Uses</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxUses ?? ''}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Unlimited"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Min Students (optional)</Label>
              <Input
                type="number"
                min={1}
                value={form.minStudents ?? ''}
                onChange={(e) => setForm({ ...form, minStudents: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="No minimum"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        open={!!confirmDeactivate}
        onOpenChange={(open) => !open && setConfirmDeactivate(null)}
        title="Deactivate Discount?"
        description={`Are you sure you want to deactivate discount code "${confirmDeactivate?.code}"? It will no longer be usable.`}
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
