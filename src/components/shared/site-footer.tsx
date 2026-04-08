import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
  disabled?: boolean;
}

const productLinks: FooterLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Beta Program', href: '/beta' },
  { label: 'For Schools', href: '#', disabled: true },
  { label: 'For Parents', href: '#', disabled: true },
];

const companyLinks: FooterLink[] = [
  { label: 'About Us', href: '#', disabled: true },
  { label: 'Contact', href: '#', disabled: true },
  { label: 'Help & Support', href: '/help' },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '#', disabled: true },
  { label: 'Delete Account', href: '/delete-account' },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  if (link.disabled) {
    return (
      <span
        aria-disabled="true"
        className="text-sm text-white/40 pointer-events-none opacity-50"
      >
        {link.label}{' '}
        <span className="text-[10px] text-white/30">(Coming Soon)</span>
      </span>
    );
  }

  return (
    <Link
      href={link.href}
      className="text-sm text-white/40 transition-colors hover:text-white/70"
    >
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-navy px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="Skunect"
                className="h-9 w-9 rounded-lg"
              />
              <span className="text-xl font-bold text-white">Skunect</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/50">
              School Management &amp; Parent Engagement Platform — connecting
              schools and families across Africa.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/80">
              Product
            </h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/80">
              Company
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white/80">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/30">
          <p>
            &copy; {new Date().getFullYear()} Skunect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
