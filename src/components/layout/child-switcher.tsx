'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useChildStore, type ChildSummary } from '@/lib/stores/child-store';
import { getParentChildren } from '@/lib/api/students';
import { cn } from '@/lib/utils';

export function ChildSwitcher() {
  const role = useAuthStore((s) => s.currentRole);
  const children = useChildStore((s) => s.children);
  const selectedChildId = useChildStore((s) => s.selectedChildId);
  const setChildren = useChildStore((s) => s.setChildren);
  const setSelectedChild = useChildStore((s) => s.setSelectedChild);

  const isParent = role === 'PARENT';

  const { data: response } = useQuery({
    queryKey: ['parent', 'children'],
    queryFn: getParentChildren,
    enabled: isParent,
  });

  // Sync children to store
  useEffect(() => {
    if (response?.data) {
      const mapped: ChildSummary[] = response.data.map((s) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        classId: s.classId,
        className: s.className,
        photo: s.photo,
      }));
      setChildren(mapped);
    }
  }, [response?.data, setChildren]);

  if (!isParent || children.length <= 1) {
    return null;
  }

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <GraduationCap className="h-4 w-4" />
          <span className="max-w-[120px] truncate">
            {selectedChild
              ? `${selectedChild.firstName} ${selectedChild.lastName}`
              : 'Select child'}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Child</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {children.map((child) => {
          const initials = `${child.firstName.charAt(0)}${child.lastName.charAt(0)}`;
          const isSelected = child.id === selectedChildId;
          return (
            <DropdownMenuItem
              key={child.id}
              onClick={() => setSelectedChild(child.id)}
              className={cn('gap-3', isSelected && 'bg-accent')}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={child.photo ?? undefined} alt={initials} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {child.firstName} {child.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{child.className}</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
