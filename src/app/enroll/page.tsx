'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

import { SiteNavbar } from '@/components/shared/site-navbar';
import { SiteFooter } from '@/components/shared/site-footer';
import { EnrollmentForm } from '@/components/features/beta/enrollment-form';
import { validateInvitationToken } from '@/lib/api/beta';
import type { BetaSignup } from '@/lib/types/beta';

function EnrollContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signup, setSignup] = useState<BetaSignup | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided. Please check your invitation email.');
      setLoading(false);
      return;
    }

    validateInvitationToken(token)
      .then((response) => {
        if (response.status === 'SUCCESS') {
          setSignup(response.data);
        } else {
          setError(response.message || 'Invalid invitation token');
        }
      })
      .catch(() => {
        setError(
          'This invitation link is invalid or has already been used. Please contact support.',
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
        <p className="text-muted-foreground">Validating invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold">Invalid Invitation</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (signup && token) {
    return (
      <div>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Complete Your Enrollment
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome, {signup.firstName}! Set up your school on Skunect.
          </p>
        </div>
        <EnrollmentForm token={token} signup={signup} />
      </div>
    );
  }

  return null;
}

export default function EnrollPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />

      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-20">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-teal" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          }
        >
          <EnrollContent />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
