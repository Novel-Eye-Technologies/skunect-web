'use client';

import Image from 'next/image';
import {
  ClipboardCheck,
  BookOpen,
  CreditCard,
  MessageCircle,
  ChevronRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { SiteNavbar } from '@/components/shared/site-navbar';
import { SiteFooter } from '@/components/shared/site-footer';
import { BetaSignupForm } from '@/components/features/beta/beta-signup-form';
import { Reveal } from '@/components/shared/scroll-reveal';

const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk2iLajgAAAABJRU5ErkJggg==';

const painPoints = [
  {
    icon: ClipboardCheck,
    title: 'Attendance Visibility',
    description:
      "Never wonder if your child made it to school. Get real-time attendance alerts the moment it\u2019s marked.",
  },
  {
    icon: BookOpen,
    title: 'Grades & Homework',
    description:
      'Track every test score, CA, and assignment. No more waiting for report cards to know how your child is doing.',
  },
  {
    icon: CreditCard,
    title: 'Fee Transparency',
    description:
      "See exactly what\u2019s been paid, what\u2019s outstanding, and what\u2019s coming next. No more paper receipts.",
  },
  {
    icon: MessageCircle,
    title: 'Direct Communication',
    description:
      "Message your child\u2019s teacher directly from the app. No more scheduling visits just to check in.",
  },
];

const betaBenefits = [
  'Free access during the entire beta period',
  'Priority support and a direct feedback channel',
  'Help shape the product with your input',
  'Early adopter pricing when we launch',
];

export default function BetaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar ctaLabel="Apply for Beta" ctaHref="/beta#signup" />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-navy px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_40%,rgba(42,157,143,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(212,168,67,0.06),transparent)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal/15 px-4 py-1.5 text-sm font-medium text-teal">
            <Sparkles className="h-4 w-4" />
            Beta Program — Now Accepting Schools
          </div>
          <h1 className="font-display text-4xl leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Too Busy to Visit Your{' '}
            <span className="bg-gradient-to-r from-teal to-emerald-400 bg-clip-text text-transparent">
              Child&apos;s School?
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl">
            Skunect brings the school to your phone. Real-time attendance,
            grades, fees, and direct teacher messaging — so you&apos;re always
            involved, even when you can&apos;t visit.
          </p>
          <div className="mt-8">
            <a
              href="#signup"
              className="inline-flex items-center gap-2 rounded-lg bg-teal px-6 py-3 font-semibold text-white transition-colors hover:bg-teal/90"
            >
              Apply for Beta Access
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="bg-cream px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                The Problems We Solve
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Parents want to stay involved. Schools need better tools.
                Skunect bridges the gap.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {painPoints.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="group h-full rounded-2xl border bg-white p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal transition-colors duration-300 group-hover:bg-teal group-hover:text-white">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Preview ── */}
      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal direction="left">
              <div>
                <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                  Everything in One Dashboard
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Admins manage the school. Teachers handle attendance and
                  grades. Parents stay connected. All on one platform.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    'Digital attendance with real-time parent notifications',
                    'Complete grade book with continuous assessment tracking',
                    'Homework assignment and submission management',
                    'Fee invoicing with payment status tracking',
                    'Direct parent-teacher messaging',
                    'Student safety and welfare monitoring',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10">
                        <Check className="h-3.5 w-3.5 text-teal" />
                      </div>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal direction="right" delay={150}>
              <div className="overflow-hidden rounded-2xl border shadow-lg">
                <Image
                  src="/screenshots/admin-dashboard.png"
                  alt="Skunect Admin Dashboard"
                  width={1280}
                  height={960}
                  className="w-full"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Beta Benefits + Signup ── */}
      <section
        id="signup"
        className="border-t bg-sage/30 px-4 py-24 sm:px-6 sm:py-32"
      >
        <div className="mx-auto max-w-5xl">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Benefits */}
            <Reveal direction="left">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 text-sm font-medium text-teal">
                  <Sparkles className="h-4 w-4" />
                  Beta Program
                </div>
                <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                  Get Started for Free
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Join the beta program and enjoy free access while you help us
                  build the best school management platform for African schools.
                </p>
                <ul className="mt-8 space-y-4">
                  {betaBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10">
                        <Check className="h-3.5 w-3.5 text-teal" />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Form */}
            <Reveal direction="right" delay={150}>
              <BetaSignupForm />
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
