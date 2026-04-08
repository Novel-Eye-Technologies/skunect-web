'use client';

import { SiteNavbar } from '@/components/shared/site-navbar';
import { SiteFooter } from '@/components/shared/site-footer';
import { PageHeader } from '@/components/shared/page-header';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />
      
      <main id="main-content" className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <PageHeader
            title="Privacy Policy"
            description="Last updated: April 8, 2026"
          />

          <div className="prose prose-slate max-w-none rounded-2xl border bg-white p-8 shadow-sm sm:p-12">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our Privacy Policy is currently being updated.
            </p>
            

            <div className="mt-12 rounded-xl bg-teal/5 p-6 border border-teal/10">
              <h3 className="text-sm font-semibold text-teal uppercase tracking-wider mb-2">Contact Us</h3>
              <p className="text-sm text-muted-foreground">
                If you have any questions about how we handle your data, please contact us at <a href="mailto:support@skunect.com" className="text-teal hover:underline font-medium">support@skunect.com</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
