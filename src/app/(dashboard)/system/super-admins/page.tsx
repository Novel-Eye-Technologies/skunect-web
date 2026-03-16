'use client';

import { useEffect, useState, useCallback } from 'react';
import { Shield, Plus, UserPlus, Pencil, Trash2, Power, PowerOff } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getAllSuperAdmins,
  createSuperAdmin,
  updateSuperAdmin,
  deactivateSuperAdmin,
  activateSuperAdmin,
  deleteSuperAdmin,
} from '@/lib/api/admin';
import type { SuperAdminUser, CreateSuperAdminRequest, UpdateSuperAdminRequest } from '@/lib/types/admin';
import { toast } from 'sonner';

const emptyCreateForm: CreateSuperAdminRequest = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
};

const emptyEditForm: UpdateSuperAdminRequest = {
  firstName: '',
  lastName: '',
};

export default function SuperAdminsPage() {
  const [admins, setAdmins] = useState<SuperAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateSuperAdminRequest>(emptyCreateForm);
  const [submitting, setSubmitting] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SuperAdminUser | null>(null);
  const [editForm, setEditForm] = useState<UpdateSuperAdminRequest>(emptyEditForm);

  // Confirm action
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'deactivate' | 'activate';
    admin: SuperAdminUser;
  } | null>(null);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllSuperAdmins();
      if (response.status === 'SUCCESS') {
        setAdmins(response.data);
      } else {
        setError(response.message ?? 'Failed to load super admins');
      }
    } catch {
      setError('Failed to load super admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  function openEditDialog(admin: SuperAdminUser) {
    setEditingAdmin(admin);
    setEditForm({
      firstName: admin.firstName,
      lastName: admin.lastName,
    });
    setEditOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (createForm.phone && !/^\+234\d{10}$/.test(createForm.phone)) {
      toast.error('Phone must start with +234 followed by 10 digits');
      return;
    }

    setSubmitting(true);

    try {
      const data: CreateSuperAdminRequest = {
        email: createForm.email,
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        ...(createForm.phone && { phone: createForm.phone }),
      };

      const res = await createSuperAdmin(data);
      if (res.status === 'SUCCESS') {
        toast.success('Super admin created successfully');
        setCreateOpen(false);
        setCreateForm(emptyCreateForm);
        fetchAdmins();
      } else {
        toast.error(res.message ?? 'Failed to create super admin');
      }
    } catch {
      toast.error('Failed to create super admin');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAdmin) return;
    setSubmitting(true);

    try {
      const res = await updateSuperAdmin(editingAdmin.id, editForm);
      if (res.status === 'SUCCESS') {
        toast.success('Super admin updated successfully');
        setEditOpen(false);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        toast.error(res.message ?? 'Failed to update super admin');
      }
    } catch {
      toast.error('Failed to update super admin');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;

    try {
      const { type, admin } = confirmAction;

      if (type === 'delete') {
        const res = await deleteSuperAdmin(admin.id);
        if (res.status === 'SUCCESS') toast.success('Super admin role removed');
        else toast.error(res.message ?? 'Failed to remove super admin');
      } else if (type === 'deactivate') {
        const res = await deactivateSuperAdmin(admin.id);
        if (res.status === 'SUCCESS') toast.success('Super admin deactivated');
        else toast.error(res.message ?? 'Failed to deactivate super admin');
      } else {
        const res = await activateSuperAdmin(admin.id);
        if (res.status === 'SUCCESS') toast.success('Super admin activated');
        else toast.error(res.message ?? 'Failed to activate super admin');
      }

      setConfirmAction(null);
      fetchAdmins();
    } catch {
      toast.error('Action failed');
      setConfirmAction(null);
    }
  }

  function getSuperAdminRoleStatus(admin: SuperAdminUser): boolean {
    const saRole = admin.roles.find((r) => r.role === 'SUPER_ADMIN');
    return saRole?.isActive ?? false;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admins"
        description="Manage platform-level administrators"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Super Admin
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Super Administrators
          </CardTitle>
          <CardDescription>
            {admins.length} super admin{admins.length !== 1 ? 's' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchAdmins}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => {
                    const roleActive = getSuperAdminRoleStatus(admin);
                    return (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          {admin.firstName} {admin.lastName}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {admin.phone || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleActive ? 'default' : 'secondary'}>
                            {roleActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(admin)}
                              aria-label="Edit name"
                              title="Edit name"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setConfirmAction({
                                  type: roleActive ? 'deactivate' : 'activate',
                                  admin,
                                })
                              }
                              aria-label={roleActive ? 'Deactivate' : 'Activate'}
                              title={roleActive ? 'Deactivate' : 'Activate'}
                            >
                              {roleActive ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setConfirmAction({ type: 'delete', admin })
                              }
                              aria-label="Remove super admin role"
                              title="Remove super admin role"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {admins.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No super admins found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Super Admin Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Super Admin
            </DialogTitle>
            <DialogDescription>
              Create a new platform-level administrator. They will be able to log in using the provided email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-firstName">First Name *</Label>
                <Input
                  id="create-firstName"
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-lastName">Last Name *</Label>
                <Input
                  id="create-lastName"
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="create-phone">Phone</Label>
                <Input
                  id="create-phone"
                  type="tel"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  pattern="^\+234\d{10}$"
                  title="Phone must start with +234 followed by 10 digits"
                  placeholder="+234..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Super Admin'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Super Admin Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Super Admin</DialogTitle>
            <DialogDescription>
              Update the super admin&apos;s name. Email and phone cannot be modified after creation.
            </DialogDescription>
          </DialogHeader>
          {editingAdmin && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <Input value={editingAdmin.email} disabled />
              </div>
              {editingAdmin.phone && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Phone</Label>
                  <Input value={editingAdmin.phone} disabled />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name *</Label>
                  <Input
                    id="edit-firstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name *</Label>
                  <Input
                    id="edit-lastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Update'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'delete'
                ? 'Remove Super Admin Role'
                : confirmAction?.type === 'deactivate'
                  ? 'Deactivate Super Admin'
                  : 'Activate Super Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'delete'
                ? `Are you sure you want to remove the super admin role from "${confirmAction.admin.firstName} ${confirmAction.admin.lastName}"? They will lose all platform-level access.`
                : confirmAction?.type === 'deactivate'
                  ? `Are you sure you want to deactivate "${confirmAction?.admin.firstName} ${confirmAction?.admin.lastName}"? They will not be able to access the platform as a super admin.`
                  : `Are you sure you want to re-activate "${confirmAction?.admin.firstName} ${confirmAction?.admin.lastName}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={confirmAction?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {confirmAction?.type === 'delete'
                ? 'Remove Role'
                : confirmAction?.type === 'deactivate'
                  ? 'Deactivate'
                  : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
