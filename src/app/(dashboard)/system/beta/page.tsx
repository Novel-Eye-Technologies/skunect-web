'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Send,
  Search,
  Filter,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { EmptyState } from '@/components/shared/empty-state';
import { TableSkeleton } from '@/components/shared/loading-skeleton';
import {
  getBetaSignups,
  getBetaSignupStats,
  sendBetaInvitations,
  type BetaSignupListParams,
} from '@/lib/api/beta';
import type { BetaSignup, BetaSignupStats } from '@/lib/types/beta';
import { getApiErrorMessage } from '@/lib/utils/get-error-message';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONTACTED: 'bg-blue-100 text-blue-800',
  INVITED: 'bg-purple-100 text-purple-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  ENROLLED: 'bg-teal-100 text-teal-800',
};

const roleLabels: Record<string, string> = {
  SCHOOL_OWNER: 'School Owner',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
};

export default function BetaSignupsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<BetaSignupListParams>({
    page: 0,
    size: 20,
    sort: 'createdAt',
    direction: 'DESC',
  });
  const [searchValue, setSearchValue] = useState('');

  const { data: signupsResponse, isLoading } = useQuery({
    queryKey: ['beta-signups', filters],
    queryFn: () => getBetaSignups(filters),
  });

  const { data: statsResponse } = useQuery({
    queryKey: ['beta-signups-stats'],
    queryFn: () => getBetaSignupStats(),
  });

  const inviteMutation = useMutation({
    mutationFn: (signupIds: string[]) =>
      sendBetaInvitations({ signupIds }),
    onSuccess: (response) => {
      const count = response.data?.length ?? 0;
      toast.success(`${count} invitation(s) sent`);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['beta-signups'] });
      queryClient.invalidateQueries({ queryKey: ['beta-signups-stats'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to send invitations'));
    },
  });

  const signups: BetaSignup[] = signupsResponse?.data ?? [];
  const stats: BetaSignupStats | null = statsResponse?.data ?? null;
  const meta = signupsResponse?.meta;

  function handleSearch() {
    setFilters((prev) => ({ ...prev, search: searchValue || undefined, page: 0 }));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === signups.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(signups.map((s) => s.id)));
    }
  }

  function handleSendInvitations() {
    const invitableIds = signups
      .filter(
        (s) =>
          selectedIds.has(s.id) &&
          (s.status === 'PENDING' || s.status === 'CONTACTED'),
      )
      .map((s) => s.id);

    if (invitableIds.length === 0) {
      toast.error('No eligible signups selected (must be PENDING or CONTACTED)');
      return;
    }

    inviteMutation.mutate(invitableIds);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Beta Signups"
        description="Manage beta program interest signups and invitations"
      />

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard title="Total" value={stats.total} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="Contacted" value={stats.contacted} />
          <StatCard title="Invited" value={stats.invited} />
          <StatCard title="Accepted" value={stats.accepted} />
          <StatCard title="Enrolled" value={stats.enrolled} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or school..."
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Select
          value={filters.role || 'all'}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              role: v === 'all' ? undefined : v,
              page: 0,
            }))
          }
        >
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="SCHOOL_OWNER">School Owner</SelectItem>
            <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
            <SelectItem value="PARENT">Parent</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              status: v === 'all' ? undefined : v,
              page: 0,
            }))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="INVITED">Invited</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="ENROLLED">Enrolled</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} variant="outline" size="sm">
          <Search className="mr-1 h-4 w-4" />
          Search
        </Button>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            onClick={handleSendInvitations}
            disabled={inviteMutation.isPending}
          >
            {inviteMutation.isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-1 h-4 w-4" />
            )}
            Send Invitation
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : signups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No signups yet"
          description="Beta signups will appear here once submitted"
        />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        signups.length > 0 && selectedIds.size === signups.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {signups.map((signup) => (
                  <TableRow
                    key={signup.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/system/beta/${signup.id}`)
                    }
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(signup.id)}
                        onCheckedChange={() => toggleSelect(signup.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {signup.firstName} {signup.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {signup.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {roleLabels[signup.role] || signup.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {signup.schoolName || '—'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[signup.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {signup.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(signup.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {meta.page * meta.size + 1} to{' '}
                {Math.min((meta.page + 1) * meta.size, meta.totalElements)} of{' '}
                {meta.totalElements}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page === 0}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages - 1}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
