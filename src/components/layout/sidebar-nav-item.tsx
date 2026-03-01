'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/utils/navigation';

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarNavItem({
  item,
  collapsed,
  onNavigate,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;

  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const isChildActive = hasChildren
    ? item.children!.some(
        (child) =>
          pathname === child.href || pathname.startsWith(`${child.href}/`),
      )
    : false;

  const [expanded, setExpanded] = useState(isActive || isChildActive);

  const Icon = item.icon;

  // When collapsed, render a tooltip-wrapped icon link
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
              isActive || isChildActive
                ? 'bg-[#2A9D8F]/20 text-[#2A9D8F]'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Expanded mode
  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive || isChildActive
              ? 'bg-[#2A9D8F]/20 text-[#2A9D8F]'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          )}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="flex-1 text-left">{item.title}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              expanded && 'rotate-180',
            )}
          />
        </button>
        <div
          className={cn(
            'grid transition-all duration-200',
            expanded
              ? 'grid-rows-[1fr] opacity-100'
              : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
              {item.children!.map((child) => {
                const isSubActive =
                  pathname === child.href ||
                  pathname.startsWith(`${child.href}/`);

                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                      isSubActive
                        ? 'bg-[#2A9D8F]/15 text-[#2A9D8F] font-medium'
                        : 'text-white/60 hover:bg-white/5 hover:text-white/90',
                    )}
                  >
                    <span>{child.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Simple nav item (no children)
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-[#2A9D8F]/20 text-[#2A9D8F]'
          : 'text-white/70 hover:bg-white/10 hover:text-white',
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{item.title}</span>
    </Link>
  );
}
