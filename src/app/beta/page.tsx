'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ClipboardCheck,
  BookOpen,
  CreditCard,
  MessageCircle,
  ChevronRight,
  Check,
  Sparkles,
  Shield,
} from 'lucide-react';
import { SiteFooter } from '@/components/shared/site-footer';
import { BetaSignupForm } from '@/components/features/beta/beta-signup-form';

const painPoints = [
  {
    icon: ClipboardCheck,
    title: 'Attendance Visibility',
    description:
      "Never wonder if your child made it to school. Get real-time attendance alerts the moment it's marked.",
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: BookOpen,
    title: 'Grades & Homework',
    description:
      "Track every test score, CA, and assignment. No more waiting for report cards to know how your child is doing.",
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: CreditCard,
    title: 'Fee Transparency',
    description:
      "See exactly what's been paid, what's outstanding, and what's coming next. No more paper receipts.",
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: MessageCircle,
    title: 'Direct Communication',
    description:
      "Message your child's teacher directly from the app. No more scheduling visits just to check in.",
    gradient: 'from-violet-500 to-purple-600',
  },
];

const betaBenefits = [
  'Free access during the beta period',
  'Priority support and direct feedback channel',
  'Help shape the product with your input',
  'Early adopter benefits when we launch',
];

export default function BetaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal nav — logo only */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Skunect" className="h-9 w-9 rounded-lg" />
            <span className="text-xl font-bold tracking-tight">Skunect</span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="absolute inset-0 opacity-[0.06]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, var(--color-teal) 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, var(--color-teal) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-teal/20 px-4 py-1.5 text-sm font-medium text-teal">
            <Sparkles className="h-4 w-4" />
            Beta Program — Now Accepting Schools
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Too Busy to Visit Your{' '}
            <span className="bg-gradient-to-r from-teal to-emerald-400 bg-clip-text text-transparent">
              Child&apos;s School?
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
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

      {/* Pain Points */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The Problems We Solve
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Parents want to stay involved. Schools need better tools.
              Skunect bridges the gap.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {painPoints.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-sm`}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="border-y bg-muted/30 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything in One Dashboard
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Admins manage the school. Teachers handle attendance and grades.
                Parents stay connected. All on one platform.
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
            <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
              <Image
                src="/screenshots/admin-dashboard.png"
                alt="Skunect Admin Dashboard"
                width={1280}
                height={960}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Beta Benefits */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy to-[#1a3a5c] px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="mx-auto max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal/20 px-3 py-1 text-sm font-medium text-teal">
                <Shield className="h-4 w-4" />
                Beta Program
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Get Started for Free
              </h2>
              <p className="mt-4 text-lg text-white/70">
                Join the beta program and enjoy free access while you help us
                build the best school management platform for African schools.
              </p>
              <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
                {betaBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/20">
                      <Check className="h-3 w-3 text-teal" />
                    </div>
                    <span className="text-sm text-white/80">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <a
                  href="#signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal px-6 py-3 font-semibold text-white transition-colors hover:bg-teal/90"
                >
                  Apply Now
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup" className="border-t bg-muted/30 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-xl">
          <BetaSignupForm />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
