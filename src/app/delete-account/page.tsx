'use client';

import { ShieldAlert, Users, Mail, ArrowRight } from 'lucide-react';
import { SiteNavbar } from '@/components/shared/site-navbar';
import { SiteFooter } from '@/components/shared/site-footer';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DeleteAccountPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />
      
      <main id="main-content" className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <PageHeader
            title="Delete Account"
            description="Understanding how account deletion works on Skunect."
          />

          <Card className="overflow-hidden border-none shadow-xl ring-1 ring-border">
            <div className="bg-navy p-8 text-white sm:p-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white mb-6">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl tracking-tight mb-4">Account Deletion Policy</h2>
              <p className="text-white/70 leading-relaxed">
                On the Skunect platform, user accounts and data are primarily managed by individual schools. This ensures that student and educational records are handled securely and in compliance with school policies.
              </p>
            </div>
            
            <CardContent className="p-8 sm:p-12 space-y-8 bg-white">
              <div className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Managed by School Admin</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    If you wish to delete your account or have your personal data removed from Skunect, please contact your school&apos;s administration office directly. 
                  </p>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    School administrators have the authority to manage user access, deactivate accounts, and remove data associated with their institution.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border p-6 bg-muted/30">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-navy">
                  <Mail className="h-4 w-4" />
                  Need further assistance?
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have already contacted your school administrator and are experiencing issues, or if you are a school administrator yourself wishing to close a school account, please reach out to our support team.
                </p>
                <Link href="mailto:support@skunect.com">
                  <Button variant="outline" className="gap-2">
                    Email Skunect Support
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="text-sm text-muted-foreground italic border-t pt-6">
                Important: Deleting an account is permanent. All historical data, including grades, attendance records, and messages, may be removed unless otherwise required by law or school data retention policies.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
