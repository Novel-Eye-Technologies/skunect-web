'use client';

import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getAllSchools } from '@/lib/api/admin';
import type { SchoolSummary } from '@/lib/types/admin';

export default function AllSchoolsPage() {
  const [schools, setSchools] = useState<SchoolSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchools() {
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
    }

    fetchSchools();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Schools"
        description="Manage all registered schools across the platform"
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
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Teachers</TableHead>
                    <TableHead className="text-center">Admins</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">
                        {school.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {school.code}
                      </TableCell>
                      <TableCell>
                        {school.city}, {school.state}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{school.subscriptionTier}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {school.studentCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {school.teacherCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {school.adminCount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={school.isActive ? 'default' : 'secondary'}
                        >
                          {school.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(school.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {schools.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
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
    </div>
  );
}
