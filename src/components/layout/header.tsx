'use client';

import { Menu } from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui-store';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { NotificationBell } from '@/components/layout/notification-bell';
import { SchoolSwitcher } from '@/components/layout/school-switcher';
import { ChildSwitcher } from '@/components/layout/child-switcher';
import { UserMenu } from '@/components/layout/user-menu';
import { Separator } from '@/components/ui/separator';

export function Header() {
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs */}
      <div className="hidden flex-1 lg:flex">
        <Breadcrumbs />
      </div>

      {/* Spacer for mobile */}
      <div className="flex-1 lg:hidden" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <SchoolSwitcher />
        <ChildSwitcher />
        <NotificationBell />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <UserMenu />
      </div>
    </header>
  );
}
