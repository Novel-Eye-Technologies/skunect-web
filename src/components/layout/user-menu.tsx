'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';

export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const currentRole = useAuthStore((s) => s.currentRole);
  const logoutFn = useAuthStore((s) => s.logout);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U';

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';

  function handleLogout() {
    logoutFn();
    router.push('/login');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar size="default">
            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={fullName} />}
            <AvatarFallback className="bg-navy text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Open user menu</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold leading-none">{fullName}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            {currentRole && (
              <Badge
                variant="secondary"
                className="mt-1 w-fit text-[10px] uppercase tracking-wider"
              >
                {currentRole}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push('/profile')}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          variant="destructive"
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
