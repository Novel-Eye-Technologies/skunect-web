'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Users,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { useParent, useParentChildren } from '@/lib/hooks/use-parents';
import { formatDate } from '@/lib/utils/format-date';
import type { ChildSummary } from '@/lib/api/parents';

export function ParentDetailClient() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawParam = params.parentId as string;
  const parentId =
    !rawParam || rawParam === '_'
      ? pathname.split('/').filter(Boolean)[1] ?? rawParam
      : rawParam;

  const { data: parentResponse, isLoading } = useParent(parentId);
  const parent = parentResponse?.data;

  const { data: childrenResponse, isLoading: childrenLoading } = useParentChildren(parentId);
  const children = childrenResponse?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/parents')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Parents
        </Button>
        <p className="text-muted-foreground">Parent not found.</p>
      </div>
    );
  }

  const initials = `${parent.firstName.charAt(0)}${parent.lastName.charAt(0)}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${parent.firstName} ${parent.lastName}`}
        description={parent.email}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push('/parents')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {parent.firstName} {parent.lastName}
                </h2>
                <StatusBadge status={parent.status} className="mt-1" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{parent.email}</span>
                </div>
                {parent.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{parent.phone}</span>
                  </div>
                )}
                <div className="text-muted-foreground">
                  <span className="font-medium">Joined:</span>{' '}
                  {formatDate(parent.createdAt)}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium">Last Login:</span>{' '}
                  {parent.lastLogin ? formatDate(parent.lastLogin) : 'Never'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-blue-500/10 p-2">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{children.length}</p>
                <p className="text-sm text-muted-foreground">Children</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-green-500/10 p-2">
                <GraduationCap className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {children.filter((c) => c.status === 'ACTIVE').length}
                </p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="children" className="space-y-4">
        <TabsList>
          <TabsTrigger value="children">
            Children ({children.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="children">
          {childrenLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : children.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No children linked to this parent.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Admission No</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Class</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {children.map((child: ChildSummary) => (
                        <tr key={child.studentId} className="border-b last:border-0">
                          <td className="py-2 pr-4">
                            <button
                              type="button"
                              className="font-medium text-left hover:underline text-primary"
                              onClick={() => router.push(`/students/${child.studentId}`)}
                            >
                              {child.firstName} {child.lastName}
                            </button>
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {child.admissionNumber ?? '—'}
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {child.className ?? '—'}
                          </td>
                          <td className="py-2">
                            <StatusBadge status={child.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
