'use client';

import { ChevronsUpDown, School, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';

export function SchoolSwitcher() {
  const user = useAuthStore((s) => s.user);
  const currentSchoolId = useAuthStore((s) => s.currentSchoolId);
  const setCurrentSchool = useAuthStore((s) => s.setCurrentSchool);

  const schools = user?.roles.filter((r) => r.schoolId !== null) ?? [];

  // Only render if user has multiple schools (SUPER_ADMIN has no schools)
  if (schools.length <= 1) {
    return null;
  }

  const currentSchool = schools.find((r) => r.schoolId === currentSchoolId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <School className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[140px] truncate font-medium">
            {currentSchool?.schoolName ?? 'Select School'}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Switch School
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {schools.map((schoolRole) => (
          <DropdownMenuItem
            key={schoolRole.schoolId}
            onClick={() => schoolRole.schoolId && setCurrentSchool(schoolRole.schoolId)}
            className="cursor-pointer"
          >
            <div className="flex w-full items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {schoolRole.schoolName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {schoolRole.role.toLowerCase()}
                </p>
              </div>
              {schoolRole.schoolId === currentSchoolId && (
                <Check
                  className={cn(
                    'ml-2 h-4 w-4 shrink-0 text-[#2A9D8F]',
                  )}
                />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
