'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { navigationConfig } from '@/lib/utils/navigation';
import { SidebarNavItem } from '@/components/layout/sidebar-nav-item';

export function MobileNav() {
  const open = useUIStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);
  const currentRole = useAuthStore((s) => s.currentRole);
  const user = useAuthStore((s) => s.user);
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);

  const filteredNav = navigationConfig.filter((item) =>
    currentRole ? item.roles.includes(currentRole as 'ADMIN' | 'TEACHER' | 'PARENT' | 'SUPER_ADMIN') : false,
  );

  const currentSchool = user?.roles.find((r) => r.schoolId === currentSchoolId);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && closeMobileSidebar()}>
      <SheetContent
        side="left"
        className="w-72 border-r-0 bg-[#1B2A4A] p-0 text-white [&>button]:text-white/70 [&>button]:hover:text-white"
        showCloseButton
      >
        <SheetHeader className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2A9D8F] text-sm font-bold text-white">
              S
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-sm font-semibold text-white">
                {currentSchool?.schoolName ?? 'Skunect'}
              </SheetTitle>
              <p className="truncate text-xs text-white/50">School Management</p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4">
          <TooltipProvider>
            <nav className="space-y-1 px-3">
              {filteredNav.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  collapsed={false}
                  onNavigate={closeMobileSidebar}
                />
              ))}
            </nav>
          </TooltipProvider>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
