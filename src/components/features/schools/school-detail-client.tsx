'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  Layers,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
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
  getSchool,
  createSchoolAdmin,
  updateSchoolAdmin,
  deactivateSchoolAdmin,
  activateSchoolAdmin,
  deleteSchoolAdmin,
} from '@/lib/api/admin';
import type {
  SchoolDetailResponse,
  CreateSchoolAdminRequest,
  UpdateSchoolAdminRequest,
  SuperAdminUser,
} from '@/lib/types/admin';
import { toast } from 'sonner';

const emptyAdminForm: CreateSchoolAdminRequest = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
};

export function SchoolDetailClient() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  // In a static export, useParams() may return the placeholder value ('_') when
  // CloudFront serves the pre-rendered page for a different dynamic segment.
  // Fall back to extracting the real ID from the pathname.
  const rawParam = params.schoolId as string;
  const schoolId =
    !rawParam || rawParam === '_'
      ? pathname.split('/').filter(Boolean).pop() ?? rawParam
      : rawParam;

  const [school, setSchool] = useState<SchoolDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create admin dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [adminForm, setAdminForm] = useState<CreateSchoolAdminRequest>(emptyAdminForm);
  const [submitting, setSubmitting] = useState(false);

  // Edit admin dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SuperAdminUser | null>(null);
  const [editForm, setEditForm] = useState<UpdateSchoolAdminRequest>({ firstName: '', lastName: '' });

  // Confirm action
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'deactivate' | 'activate';
    admin: SuperAdminUser;
  } | null>(null);

  const fetchSchool = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSchool(schoolId);
      if (response.status === 'SUCCESS') {
        setSchool(response.data);
      } else {
        setError(response.message ?? 'Failed to load school');
      }
    } catch {
      setError('Failed to load school');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (schoolId && schoolId !== '_') fetchSchool();
  }, [schoolId, fetchSchool]);

  function openEditAdminDialog(admin: SuperAdminUser) {
    setEditingAdmin(admin);
    setEditForm({ firstName: admin.firstName, lastName: admin.lastName });
    setEditDialogOpen(true);
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();

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
      const res = await createSchoolAdmin(schoolId, data);
      if (res.status === 'SUCCESS') {
        toast.success('School admin created');
        setCreateDialogOpen(false);
        setAdminForm(emptyAdminForm);
        fetchSchool();
      } else {
        toast.error(res.message ?? 'Failed to create admin');
      }
    } catch {
      toast.error('Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAdmin) return;
    setSubmitting(true);
    try {
      const res = await updateSchoolAdmin(schoolId, editingAdmin.id, editForm);
      if (res.status === 'SUCCESS') {
        toast.success('Admin updated');
        setEditDialogOpen(false);
        fetchSchool();
      } else {
        toast.error(res.message ?? 'Failed to update admin');
      }
    } catch {
      toast.error('Failed to update admin');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;
    try {
      const { type, admin } = confirmAction;
      if (type === 'delete') {
        const res = await deleteSchoolAdmin(schoolId, admin.id);
        if (res.status === 'SUCCESS') toast.success('Admin role removed');
        else toast.error(res.message ?? 'Failed to remove admin');
      } else if (type === 'deactivate') {
        const res = await deactivateSchoolAdmin(schoolId, admin.id);
        if (res.status === 'SUCCESS') toast.success('Admin deactivated');
        else toast.error(res.message ?? 'Failed to deactivate admin');
      } else {
        const res = await activateSchoolAdmin(schoolId, admin.id);
        if (res.status === 'SUCCESS') toast.success('Admin activated');
        else toast.error(res.message ?? 'Failed to activate admin');
      }
      setConfirmAction(null);
      fetchSchool();
    } catch {
      toast.error('Action failed');
      setConfirmAction(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/system/schools')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Schools
        </Button>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{error ?? 'School not found'}</p>
          <Button variant="outline" className="mt-4" onClick={fetchSchool}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Students', value: school.studentCount, icon: GraduationCap, color: 'text-blue-600' },
    { label: 'Teachers', value: school.teacherCount, icon: Users, color: 'text-green-600' },
    { label: 'Admins', value: school.adminCount, icon: UserCheck, color: 'text-purple-600' },
    { label: 'Parents', value: school.parentCount, icon: Users, color: 'text-orange-600' },
    { label: 'Classes', value: school.classCount, icon: Layers, color: 'text-indigo-600' },
    { label: 'Subjects', value: school.subjectCount, icon: BookOpen, color: 'text-pink-600' },
    { label: 'Active Sessions', value: school.activeSessionCount, icon: Calendar, color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/system/schools">
          <Button variant="ghost" size="icon" aria-label="Back to Schools">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={school.name}
          description={`School Code: ${school.code}`}
        />
        <div className="ml-auto">
          <Badge variant={school.isActive ? 'default' : 'secondary'} className="text-sm">
            {school.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* School Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            School Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {school.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{school.email}</span>
              </div>
            )}
            {school.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{school.phone}</span>
              </div>
            )}
            {(school.address || school.city || school.state) && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {[school.address, school.city, school.state].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Tier:</span>
              <Badge variant="outline">{school.subscriptionTier ?? 'STANDARD'}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Created:</span>
              <span>
                {new Date(school.createdAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>
                {new Date(school.updatedAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* School Admins Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                School Administrators
              </CardTitle>
              <CardDescription>
                {school.admins.length} admin{school.admins.length !== 1 ? 's' : ''} assigned
              </CardDescription>
            </div>
            <Button onClick={() => { setAdminForm(emptyAdminForm); setCreateDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                {school.admins.map((admin) => {
                  const adminRole = admin.roles?.find(
                    (r) => r.role === 'ADMIN' && r.schoolId === schoolId
                  );
                  const isActive = adminRole?.isActive ?? admin.isActive;

                  return (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        {admin.firstName} {admin.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                      <TableCell className="text-muted-foreground">{admin.phone ?? '—'}</TableCell>
                      <TableCell>
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditAdminDialog(admin)}
                            title="Edit admin"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setConfirmAction({
                                type: isActive ? 'deactivate' : 'activate',
                                admin,
                              })
                            }
                            title={isActive ? 'Deactivate admin' : 'Activate admin'}
                          >
                            {isActive ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmAction({ type: 'delete', admin })}
                            title="Remove admin role"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {school.admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No administrators assigned to this school
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add School Admin</DialogTitle>
            <DialogDescription>
              Create an administrator for {school.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-firstName">First Name *</Label>
                <Input
                  id="create-firstName"
                  value={adminForm.firstName}
                  onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-lastName">Last Name *</Label>
                <Input
                  id="create-lastName"
                  value={adminForm.lastName}
                  onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-full space-y-2">
                <Label htmlFor="create-phone">Phone</Label>
                <Input
                  id="create-phone"
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
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Admin'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit School Admin</DialogTitle>
            <DialogDescription>
              Update name for {editingAdmin?.firstName} {editingAdmin?.lastName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAdmin} className="space-y-4">
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
              {editingAdmin && (
                <>
                  <div className="col-span-full space-y-2">
                    <Label>Email</Label>
                    <Input value={editingAdmin.email} disabled />
                  </div>
                  {editingAdmin.phone && (
                    <div className="col-span-full space-y-2">
                      <Label>Phone</Label>
                      <Input value={editingAdmin.phone} disabled />
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Update Admin'}
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
                ? 'Remove Admin Role'
                : confirmAction?.type === 'deactivate'
                  ? 'Deactivate Admin'
                  : 'Activate Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'delete'
                ? `Are you sure you want to remove the admin role from ${confirmAction.admin.firstName} ${confirmAction.admin.lastName}?`
                : confirmAction?.type === 'deactivate'
                  ? `Are you sure you want to deactivate ${confirmAction?.admin.firstName} ${confirmAction?.admin.lastName}?`
                  : `Are you sure you want to re-activate ${confirmAction?.admin.firstName} ${confirmAction?.admin.lastName}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmAction?.type === 'delete'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              {confirmAction?.type === 'delete'
                ? 'Remove'
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
