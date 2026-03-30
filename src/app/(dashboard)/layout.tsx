'use client';

import { AuthProvider } from '@/lib/providers/auth-provider';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import { DashboardErrorFallback } from '@/components/shared/dashboard-error-fallback';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { useUIStore } from '@/lib/stores/ui-store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <QueryProvider>
      <ErrorBoundary fallback={<DashboardErrorFallback />}>
        <AuthProvider>
          <div className="relative min-h-screen bg-background">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:underline"
            >
              Skip to content
            </a>

            {/* Desktop sidebar */}
            <div className="hidden lg:block">
              <Sidebar />
            </div>

            {/* Mobile navigation sheet */}
            <MobileNav />

            {/* Main content area */}
            <div
              className={cn(
                'flex min-h-screen flex-col transition-all duration-300',
                collapsed ? 'lg:ml-[68px]' : 'lg:ml-64',
              )}
            >
              <Header />
              <main id="main-content" className="flex-1 p-4 lg:p-6">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </QueryProvider>
  );
}
