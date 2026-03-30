'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Building2, Plus, Pencil, Trash2, Power, PowerOff, UserPlus } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { StateCombobox } from '@/components/shared/state-combobox';
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
  getAllSchools,
  getSchool,
  createSchool,
  updateSchool,
  deactivateSchool,
  activateSchool,
  deleteSchool,
  createSchoolAdmin,
} from '@/lib/api/admin';
import type {
  SchoolSummary,
  CreateSchoolRequest,
  UpdateSchoolRequest,
  CreateSchoolAdminRequest,
} from '@/lib/types/admin';
import { toast } from 'sonner';

type SchoolFormData = {
  name: string;
  subscriptionTier: 'STANDARD' | 'PREMIUM';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

const emptySchoolForm: SchoolFormData = {
  name: '',
  subscriptionTier: 'STANDARD',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
};

const emptyAdminForm: CreateSchoolAdminRequest = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
};

export default function AllSchoolsPage() {
  const [schools, setSchools] = useState<SchoolSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // School dialog state
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolSummary | null>(null);
  const [schoolForm, setSchoolForm] = useState<SchoolFormData>(emptySchoolForm);
  const [submitting, setSubmitting] = useState(false);

  // Admin dialog state
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminTargetSchool, setAdminTargetSchool] = useState<SchoolSummary | null>(null);
  const [adminForm, setAdminForm] = useState<CreateSchoolAdminRequest>(emptyAdminForm);

  // Delete/toggle confirmation
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'deactivate' | 'activate';
    school: SchoolSummary;
  } | null>(null);

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllSchools();
      if (response.status === 'SUCCESS') {
        setSchools(response.data);
      } else {
        setError(response.message ?? 'Failed to load schools');
      }
    } catch {
      setError('Failed to load schools');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  function openCreateDialog() {
    setEditingSchool(null);
    setSchoolForm(emptySchoolForm);
    setSchoolDialogOpen(true);
  }

  async function openEditDialog(school: SchoolSummary) {
    setEditingSchool(school);
    setSchoolForm({
      name: school.name,
      subscriptionTier: (school.subscriptionTier === 'PREMIUM' ? 'PREMIUM' : 'STANDARD'),
      email: '',
      phone: '',
      address: '',
      city: school.city ?? '',
      state: school.state ?? '',
    });
    setSchoolDialogOpen(true);

    try {
      const res = await getSchool(school.id);
      if (res.status === 'SUCCESS') {
        const detail = res.data;
        setSchoolForm({
          name: detail.name,
          subscriptionTier: (detail.subscriptionTier === 'PREMIUM' ? 'PREMIUM' : 'STANDARD'),
          email: detail.email ?? '',
          phone: detail.phone ?? '',
          address: detail.address ?? '',
          city: detail.city ?? '',
          state: detail.state ?? '',
        });
      }
    } catch {
      // Fall back to summary data already set
    }
  }

  function openAdminDialog(school: SchoolSummary) {
    setAdminTargetSchool(school);
    setAdminForm(emptyAdminForm);
    setAdminDialogOpen(true);
  }

  async function handleSchoolSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (schoolForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (schoolForm.phone && !/^\+234\d{10}$/.test(schoolForm.phone)) {
      toast.error('Phone must start with +234 followed by 10 digits');
      return;
    }

    setSubmitting(true);

    try {
      if (editingSchool) {
        const data: UpdateSchoolRequest = {};
        if (schoolForm.name) data.name = schoolForm.name;
        data.subscriptionTier = schoolForm.subscriptionTier;
        if (schoolForm.email) data.email = schoolForm.email;
        if (schoolForm.phone) data.phone = schoolForm.phone;
        if (schoolForm.address) data.address = schoolForm.address;
        if (schoolForm.city) data.city = schoolForm.city;
        if (schoolForm.state) data.state = schoolForm.state;

        const res = await updateSchool(editingSchool.id, data);
        if (res.status === 'SUCCESS') {
          toast.success('School updated successfully');
          setSchoolDialogOpen(false);
          fetchSchools();
        } else {
          toast.error(res.message ?? 'Failed to update school');
        }
      } else {
        const data: CreateSchoolRequest = {
          name: schoolForm.name,
          subscriptionTier: schoolForm.subscriptionTier,
          ...(schoolForm.email && { email: schoolForm.email }),
          ...(schoolForm.phone && { phone: schoolForm.phone }),
          ...(schoolForm.address && { address: schoolForm.address }),
          ...(schoolForm.city && { city: schoolForm.city }),
          ...(schoolForm.state && { state: schoolForm.state }),
        };

        const res = await createSchool(data);
        if (res.status === 'SUCCESS') {
          toast.success('School created successfully');
          setSchoolDialogOpen(false);
          fetchSchools();
        } else {
          toast.error(res.message ?? 'Failed to create school');
        }
      }
    } catch {
      toast.error(editingSchool ? 'Failed to update school' : 'Failed to create school');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!adminTargetSchool) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (adminForm.phone && !/^\+234\d{10}$/.test(adminForm.phone)) {
      toast.error('Phone must start with +234 followed by 10 digits');
      return;
    }

    setSubmitting(true);

    try {
      const data: CreateSchoolAdminRequest = {
        email: adminForm.email,
        firstName: adminForm.firstName,
        lastName: adminForm.lastName,
        ...(adminForm.phone && { phone: adminForm.phone }),
      };

      const res = await createSchoolAdmin(adminTargetSchool.id, data);
      if (res.status === 'SUCCESS') {
        toast.success(`Admin created for ${adminTargetSchool.name}`);
        setAdminDialogOpen(false);
        fetchSchools();
      } else {
        toast.error(res.message ?? 'Failed to create school admin');
      }
    } catch {
      toast.error('Failed to create school admin');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;

    try {
      const { type, school } = confirmAction;
      let res;

      if (type === 'delete') {
        res = await deleteSchool(school.id);
        if (res.status === 'SUCCESS') toast.success('School deleted successfully');
        else toast.error(res.message ?? 'Failed to delete school');
      } else if (type === 'deactivate') {
        res = await deactivateSchool(school.id);
        if (res.status === 'SUCCESS') toast.success('School deactivated');
        else toast.error(res.message ?? 'Failed to deactivate school');
      } else {
        res = await activateSchool(school.id);
        if (res.status === 'SUCCESS') toast.success('School activated');
        else toast.error(res.message ?? 'Failed to activate school');
      }

      setConfirmAction(null);
      fetchSchools();
    } catch {
      toast.error('Action failed');
      setConfirmAction(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Schools"
        description="Manage all registered schools across the platform"
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add School
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Registered Schools
          </CardTitle>
          <CardDescription>
            {schools.length} school{schools.length !== 1 ? 's' : ''} registered
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
              <Button variant="outline" className="mt-4" onClick={fetchSchools}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead className="hidden md:table-cell">Code</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="hidden md:table-cell text-center">Teachers</TableHead>
                    <TableHead className="hidden md:table-cell text-center">Admins</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/system/schools/${school.id}`}
                          className="hover:underline text-primary"
                        >
                          {school.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{school.code}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {[school.city, school.state].filter(Boolean).join(', ') || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{school.subscriptionTier ?? 'STANDARD'}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{school.studentCount}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{school.teacherCount}</TableCell>
                      <TableCell className="hidden md:table-cell text-center">{school.adminCount}</TableCell>
                      <TableCell>
                        <Badge variant={school.isActive ? 'default' : 'secondary'}>
                          {school.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(school.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openAdminDialog(school)}
                            aria-label="Add school admin"
                            title="Add school admin"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(school)}
                            aria-label="Edit school"
                            title="Edit school"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setConfirmAction({
                                type: school.isActive ? 'deactivate' : 'activate',
                                school,
                              })
                            }
                            aria-label={school.isActive ? 'Deactivate school' : 'Activate school'}
                            title={school.isActive ? 'Deactivate school' : 'Activate school'}
                          >
                            {school.isActive ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setConfirmAction({ type: 'delete', school })
                            }
                            aria-label="Delete school"
                            title="Delete school"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {schools.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                        No schools registered yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit School Dialog */}
      <Dialog open={schoolDialogOpen} onOpenChange={setSchoolDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSchool ? 'Edit School' : 'Add New School'}</DialogTitle>
            <DialogDescription>
              {editingSchool
                ? 'Update school details below.'
                : 'Fill in the details to register a new school.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSchoolSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="col-span-full space-y-2">
                <Label htmlFor="school-name">School Name *</Label>
                <Input
                  id="school-name"
                  value={schoolForm.name}
                  onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label>Subscription Tier *</Label>
                <Select
                  value={schoolForm.subscriptionTier}
                  onValueChange={(value: 'STANDARD' | 'PREMIUM') =>
                    setSchoolForm({ ...schoolForm, subscriptionTier: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-email">Email</Label>
                <Input
                  id="school-email"
                  type="email"
                  value={schoolForm.email}
                  onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-phone">Phone</Label>
                <Input
                  id="school-phone"
                  type="tel"
                  value={schoolForm.phone}
                  onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                  pattern="^\+234\d{10}$"
                  title="Phone must start with +234 followed by 10 digits"
                  placeholder="+234..."
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="school-address">Address</Label>
                <Input
                  id="school-address"
                  value={schoolForm.address}
                  onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-city">City</Label>
                <Input
                  id="school-city"
                  value={schoolForm.city}
                  onChange={(e) => setSchoolForm({ ...schoolForm, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-state">State</Label>
                <StateCombobox
                  value={schoolForm.state}
                  onValueChange={(value) => setSchoolForm({ ...schoolForm, state: value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSchoolDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingSchool ? 'Update School' : 'Create School'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create School Admin Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add School Admin
            </DialogTitle>
            <DialogDescription>
              Create an administrator for <span className="font-medium">{adminTargetSchool?.name}</span>. They will be able to manage this school after logging in.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-firstName">First Name *</Label>
                <Input
                  id="admin-firstName"
                  value={adminForm.firstName}
                  onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-lastName">Last Name *</Label>
                <Input
                  id="admin-lastName"
                  value={adminForm.lastName}
                  onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="admin-email">Email *</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="admin-phone">Phone</Label>
                <Input
                  id="admin-phone"
                  type="tel"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                  pattern="^\+234\d{10}$"
                  title="Phone must start with +234 followed by 10 digits"
                  placeholder="+234..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdminDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Admin'}
              </Button>
            </DialogFooter>
          </form>
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
                ? 'Delete School'
                : confirmAction?.type === 'deactivate'
                  ? 'Deactivate School'
                  : 'Activate School'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'delete'
                ? `Are you sure you want to permanently delete "${confirmAction.school.name}"? This can only succeed if the school has no users or students.`
                : confirmAction?.type === 'deactivate'
                  ? `Are you sure you want to deactivate "${confirmAction?.school.name}"? Users will not be able to access this school.`
                  : `Are you sure you want to re-activate "${confirmAction?.school.name}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={confirmAction?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {confirmAction?.type === 'delete'
                ? 'Delete'
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
