import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t bg-navy px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/20">
                <GraduationCap className="h-5 w-5 text-teal" />
              </div>
              <span className="text-xl font-bold text-white">Skunect</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/50 leading-relaxed">
              School Management &amp; Parent Engagement Platform — connecting
              schools and families across Africa.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/80">Product</h4>
            <ul className="space-y-2">
              {[
                { label: 'Features', href: '/features' },
                { label: 'Beta Program', href: '/beta' },
                { label: 'For Schools', href: '/' },
                { label: 'For Parents', href: '/' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 transition-colors hover:text-white/70"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/80">Company</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us', href: '/' },
                { label: 'Blog', href: '/' },
                { label: 'Careers', href: '/' },
                { label: 'Contact', href: '/' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 transition-colors hover:text-white/70"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/80">Support</h4>
            <ul className="space-y-2">
              {[
                { label: 'Help Center', href: '/' },
                { label: 'Privacy Policy', href: '/' },
                { label: 'Terms of Service', href: '/' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 transition-colors hover:text-white/70"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/30">
          <p>&copy; {new Date().getFullYear()} Skunect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
