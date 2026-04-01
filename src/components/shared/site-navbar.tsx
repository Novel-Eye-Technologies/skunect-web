'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavLink {
  label: string;
  href: string;
}

interface SiteNavbarProps {
  links?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}

const defaultLinks: NavLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Beta Program', href: '/beta' },
  { label: 'FAQ', href: '/#faq' },
];

export function SiteNavbar({
  links = defaultLinks,
  ctaLabel = 'Get Started',
  ctaHref = '/register',
}: SiteNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href.startsWith('/#')) return false;
    return pathname === href || pathname === `${href}/`;
  }

  return (
    <>
      {/* Skip to content — visible on keyboard focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-teal focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none"
      >
        Skip to content
      </a>

      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Skunect" className="h-9 w-9 rounded-lg" />
            <span className="text-xl font-bold tracking-tight">Skunect</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href={ctaHref}>
              <Button size="sm">
                {ctaLabel}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="rounded-md p-1.5 transition-colors hover:bg-muted md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile menu */}
        <div
          className={`relative z-50 overflow-hidden border-t bg-background transition-all duration-200 ease-out md:hidden ${
            mobileMenuOpen
              ? 'max-h-80 opacity-100'
              : 'max-h-0 border-t-transparent opacity-0'
          }`}
        >
          <div className="px-4 pb-4 pt-2">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`block py-2 text-sm font-medium ${
                  isActive(link.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href={ctaHref}>
                <Button size="sm" className="w-full">
                  {ctaLabel}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
