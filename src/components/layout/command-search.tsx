'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useAuthStore } from '@/lib/stores/auth-store';
import { navigationConfig, type NavItem } from '@/lib/utils/navigation';

function flattenNav(items: NavItem[], role: string): { title: string; href: string; icon: NavItem['icon']; group: string }[] {
  const result: { title: string; href: string; icon: NavItem['icon']; group: string }[] = [];
  for (const item of items) {
    if (!item.roles.includes(role as 'ADMIN' | 'TEACHER' | 'PARENT' | 'SUPER_ADMIN')) continue;
    result.push({ title: item.title, href: item.href, icon: item.icon, group: 'Pages' });
    if (item.children) {
      for (const child of item.children) {
        if (!child.roles.includes(role as 'ADMIN' | 'TEACHER' | 'PARENT' | 'SUPER_ADMIN')) continue;
        result.push({ title: child.title, href: child.href, icon: child.icon, group: item.title });
      }
    }
  }
  return result;
}

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const currentRole = useAuthStore((s) => s.currentRole);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const navItems = flattenNav(navigationConfig, currentRole ?? '');

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  // Group items by their group label
  const groups = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Search pages and navigate quickly">
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groups).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    value={`${item.title} ${group}`}
                    onSelect={() => handleSelect(item.href)}
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {item.title}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
