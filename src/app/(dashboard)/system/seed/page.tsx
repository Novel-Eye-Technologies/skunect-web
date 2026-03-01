'use client';

import { useState } from 'react';
import { Database, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared/page-header';
import { resetSeedData } from '@/lib/api/admin';

export default function SeedDataPage() {
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  async function handleReset() {
    try {
      setResetting(true);
      setResult(null);
      const response = await resetSeedData();
      if (response.status === 'SUCCESS') {
        setResult({
          type: 'success',
          message: 'Seed data has been reset successfully. All test accounts and data have been refreshed.',
        });
      } else {
        setResult({
          type: 'error',
          message: response.message ?? 'Failed to reset seed data',
        });
      }
    } catch {
      setResult({
        type: 'error',
        message: 'Failed to reset seed data. Please try again.',
      });
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seed Data Management"
        description="Reset the database with fresh test data for all test scenarios"
      />

      {/* Result Banner */}
      {result && (
        <Card
          className={
            result.type === 'success'
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-red-200 bg-red-50'
          }
        >
          <CardContent className="flex items-center gap-3 py-4">
            {result.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            )}
            <p
              className={
                result.type === 'success' ? 'text-emerald-800' : 'text-red-800'
              }
            >
              {result.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reset Seed Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Reset Seed Data
          </CardTitle>
          <CardDescription>
            Reset the database to the default test data state. This will delete all
            existing data and re-create the seed data including test schools, users,
            students, and all operational records.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Warning</p>
                <p className="mt-1">
                  This action will delete ALL existing data in the database and
                  replace it with fresh seed data. Any manually created data will
                  be permanently lost.
                </p>
              </div>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={resetting}>
                {resetting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Seed Data
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete ALL data in the database and replace it with
                  fresh seed data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Test Accounts Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Test Accounts</CardTitle>
          <CardDescription>
            Available test accounts after seed data reset (OTP: 123456)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Scenario</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-3 font-medium text-purple-700">Super Admin</td>
                  <td className="px-4 py-3 font-mono text-xs">superadmin@skunect.com</td>
                  <td className="px-4 py-3">Skunect Admin</td>
                  <td className="px-4 py-3 text-muted-foreground">Platform administrator</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-blue-700">School Admin</td>
                  <td className="px-4 py-3 font-mono text-xs">admin@kingsacademy.ng</td>
                  <td className="px-4 py-3">Oluwaseun Adeyemi</td>
                  <td className="px-4 py-3 text-muted-foreground">Kings Academy Lagos</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-blue-700">School Admin</td>
                  <td className="px-4 py-3 font-mono text-xs">admin@greenfield.edu.ng</td>
                  <td className="px-4 py-3">Chika Obi</td>
                  <td className="px-4 py-3 text-muted-foreground">Greenfield International</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-emerald-700">Teacher</td>
                  <td className="px-4 py-3 font-mono text-xs">teacher1@kingsacademy.ng</td>
                  <td className="px-4 py-3">Mary Okoro</td>
                  <td className="px-4 py-3 text-muted-foreground">Teacher at Kings Academy</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-emerald-700">Teacher</td>
                  <td className="px-4 py-3 font-mono text-xs">teacher1@greenfield.edu.ng</td>
                  <td className="px-4 py-3">Amara Nwosu</td>
                  <td className="px-4 py-3 text-muted-foreground">Teacher at Greenfield</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-amber-700">Parent</td>
                  <td className="px-4 py-3 font-mono text-xs">parent1@example.com</td>
                  <td className="px-4 py-3">Adebayo Johnson</td>
                  <td className="px-4 py-3 text-muted-foreground">2 kids, same school (Kings Academy)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-amber-700">Parent</td>
                  <td className="px-4 py-3 font-mono text-xs">parent2@example.com</td>
                  <td className="px-4 py-3">Ngozi Eze</td>
                  <td className="px-4 py-3 text-muted-foreground">Cross-school parent (Kings + Greenfield)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-amber-700">Parent</td>
                  <td className="px-4 py-3 font-mono text-xs">parent3@example.com</td>
                  <td className="px-4 py-3">Funke Balogun</td>
                  <td className="px-4 py-3 text-muted-foreground">Parent at Greenfield only</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-rose-700">Dual Role</td>
                  <td className="px-4 py-3 font-mono text-xs">teacher.parent@example.com</td>
                  <td className="px-4 py-3">Kemi Adewale</td>
                  <td className="px-4 py-3 text-muted-foreground">Teacher @ Kings + Parent @ Greenfield</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
