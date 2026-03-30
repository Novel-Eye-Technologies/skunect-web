'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeft, User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSchoolSettings } from '@/lib/hooks/use-school-settings';
import { navigationConfig } from '@/lib/utils/navigation';
import { SidebarNavItem } from '@/components/layout/sidebar-nav-item';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const currentRole = useAuthStore((s) => s.currentRole);
  const user = useAuthStore((s) => s.user);

  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const { data: schoolSettings } = useSchoolSettings();
  const pathname = usePathname();

  // Filter nav items by the user's current role
  const filteredNav = navigationConfig.filter((item) =>
    currentRole ? item.roles.includes(currentRole as 'ADMIN' | 'TEACHER' | 'PARENT' | 'SUPER_ADMIN') : false,
  );

  // Track which parent nav item is expanded (only one at a time)
  const [expandedHref, setExpandedHref] = useState<string | null>(
    filteredNav.find((item) =>
      item.children?.some(
        (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
      ),
    )?.href ?? null,
  );

  function handleToggle(href: string) {
    setExpandedHref((prev) => (prev === href ? null : href));
  }

  // Get current school name
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);
  const currentSchool = user?.roles.find((r) => r.schoolId === currentSchoolId);

  // Display name for sidebar header
  const headerName = isSuperAdmin() ? 'Skunect Platform' : (currentSchool?.schoolName ?? 'Skunect');
  const headerSubtitle = isSuperAdmin() ? 'System Administration' : 'School Management';

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-white/10 bg-navy transition-all duration-300',
          collapsed ? 'w-17' : 'w-64',
        )}
      >
        {/* ---------------------------------------------------------------- */}
        {/* Logo / School name                                               */}
        {/* ---------------------------------------------------------------- */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-white/10 px-4',
            collapsed ? 'justify-center' : 'gap-3',
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal text-sm font-bold text-white overflow-hidden">
                  {schoolSettings?.logo ? (
                    <img src={schoolSettings.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    'S'
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-semibold">{headerName}</p>
                <p className="text-xs text-muted-foreground">{headerSubtitle}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal text-sm font-bold text-white overflow-hidden">
                {schoolSettings?.logo ? (
                  <img src={schoolSettings.logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  'S'
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {headerName}
                </p>
                <p className="truncate text-xs text-white/50">{headerSubtitle}</p>
              </div>
            </>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Navigation                                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-5 flex-1 overflow-y-auto scrollbar-hidden">
          <nav
            className={cn(
              'space-y-1',
              collapsed ? 'flex flex-col items-center px-2' : 'px-3',
            )}
          >
            {filteredNav.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                collapsed={collapsed}
                expanded={expandedHref === item.href}
                onToggle={() => handleToggle(item.href)}
              />
            ))}
          </nav>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Bottom section: user link + collapse toggle                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="shrink-0 border-t border-white/10 p-3">
          {/* Profile link */}
          <Link
            href="/profile"
            className={cn(
              'flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors',
              'text-white/70 hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-0',
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
              <User className="h-4 w-4 text-white/70" />
            </div>
            {!collapsed && (
              <div className="ml-3 min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {user ? `${user.firstName} ${user.lastName}` : 'Profile'}
                </p>
                <p className="truncate text-xs text-white/50">
                  {currentRole ?? 'User'}
                </p>
              </div>
            )}
          </Link>

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              'mt-2 flex w-full items-center rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white',
              collapsed && 'justify-center px-0',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5" />
                <span className="ml-3">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
