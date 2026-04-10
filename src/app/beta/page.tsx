'use client';

import Image from 'next/image';
import {
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Users,
  Smartphone,
  Check,
  Sparkles,
  ChevronRight,
  CalendarCheck,
  HeartHandshake,
  Rocket,
  Quote,
} from 'lucide-react';
import { SiteNavbar } from '@/components/shared/site-navbar';
import { SiteFooter } from '@/components/shared/site-footer';
import { BetaSignupForm } from '@/components/features/beta/beta-signup-form';
import { BetaCountdown } from '@/components/features/beta/beta-countdown';
import { WhatsAppFloat } from '@/components/features/beta/whatsapp-float';
import { Reveal } from '@/components/shared/scroll-reveal';
import { BLUR_PLACEHOLDER } from '@/lib/utils/constants';

// ---------------------------------------------------------------------------
// Content — mirrors the LinkedIn / Instagram ad creative so message-match is 1:1
// ---------------------------------------------------------------------------

const features = [
  {
    icon: ClipboardCheck,
    title: 'Digital Attendance',
    description: 'Teachers mark daily. Parents see results in real time.',
  },
  {
    icon: CreditCard,
    title: 'Fee Management',
    description: 'Structures, invoices, payment tracking. Recover fees faster.',
  },
  {
    icon: GraduationCap,
    title: 'Grades & Report Cards',
    description: 'Enter grades. Generate polished PDF reports in one click.',
  },
  {
    icon: Megaphone,
    title: 'Scheduled Announcements',
    description: 'Draft, schedule, publish. One official channel — no WhatsApp chaos.',
  },
  {
    icon: MessageSquare,
    title: 'Teacher–Parent Messaging',
    description: 'Direct chat from the app. No queues at the gate.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety & Pickup',
    description: 'Emergency alerts. QR pickup verification.',
  },
  {
    icon: Users,
    title: 'Student Management',
    description: 'Enrollment, classes, promotion, records — all in one place.',
  },
  {
    icon: Smartphone,
    title: 'Parent Mobile App',
    description: 'iOS & Android. Parents see everything, anytime.',
  },
];

const pilotIncludes = [
  {
    icon: Rocket,
    title: 'Completely free during beta',
    description:
      "No student cap. No feature limits. No credit card. Run your entire school on Skunect at zero cost through the pilot.",
  },
  {
    icon: HeartHandshake,
    title: 'Dedicated onboarding & support',
    description:
      'We handle data migration from your current system or spreadsheets, train your staff on-site in Lagos, and give you a direct line to the founder.',
  },
  {
    icon: CalendarCheck,
    title: 'Founding-school discount after beta',
    description:
      "When the pilot ends, you lock in a permanent founding-school discount on our regular pricing. You’ll never pay full price.",
  },
];

const whySkunect = [
  'Built from months of field research with Nigerian parents and private-school teachers — not a generic SaaS template',
  'Designed around the real workflows schools already run on paper and WhatsApp',
  'One platform replaces 5+ tools: registers, report cards, fee spreadsheets, parent groups, pickup lists',
  'Works on the phones your teachers already carry — no new hardware, no IT department required',
];

export default function BetaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar ctaLabel="Claim Pilot Slot" ctaHref="/beta#signup" />

      {/* ─────────────────────────────────────────────────────────── */}
      {/* HERO — message-matched to the ad creative                   */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section
        id="main-content"
        className="relative overflow-hidden bg-navy px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:pb-28"
      >
        {/* Atmosphere */}
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_15%_25%,rgba(42,157,143,0.22),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_85%_70%,rgba(212,168,67,0.10),transparent_65%)]" />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-start gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            {/* ── Left: Copy ── */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-teal/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal ring-1 ring-teal/25">
                  <Sparkles className="h-3.5 w-3.5" />
                  Free Beta — Limited Spots
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/70 ring-1 ring-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D4A843] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D4A843]" />
                  </span>
                  Lagos pilot • 10 schools only
                </span>
              </div>

              <h1 className="mt-6 font-display text-[2.5rem] leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
                Your School Deserves
                <br />
                a{' '}
                <span className="bg-gradient-to-r from-teal via-emerald-300 to-teal bg-clip-text text-transparent">
                  Digital Backbone.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
                All-in-one school management that connects your school with
                parents. Attendance, fees, grades, messaging, safety — every
                workflow your school runs, in one modern platform.{' '}
                <span className="font-semibold text-white">
                  Now in free beta.
                </span>
              </p>

              {/* Countdown */}
              <div className="mt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                  Beta launches April 30 — secure your slot now
                </p>
                <BetaCountdown variant="dark" />
              </div>

              {/* Dual CTA */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-teal px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal/25 transition-all hover:bg-teal/90 hover:shadow-xl hover:shadow-teal/30"
                >
                  Claim your pilot slot
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href="https://wa.me/2348038011663?text=Hi%20Skunect%2C%20I%27d%20like%20to%20book%20a%2020-minute%20demo%20for%20my%20school."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-6 py-3.5 text-base font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/10"
                >
                  <MessageSquare className="h-4 w-4" />
                  Book a 20-min demo
                </a>
              </div>

              {/* Trust row */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60">
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal" />
                  Free setup & migration
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal" />
                  On-site staff training
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal" />
                  Direct founder WhatsApp
                </span>
              </div>
            </div>

            {/* ── Right: Signup form in hero ── */}
            <div id="signup" className="lg:pt-2">
              <div className="relative">
                {/* Decorative glow */}
                <div
                  className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-teal/30 via-transparent to-[#D4A843]/20 opacity-60 blur-xl"
                  aria-hidden
                />
                <div className="relative rounded-3xl bg-white/[0.03] p-1 ring-1 ring-white/10 backdrop-blur-md">
                  <div className="rounded-[1.35rem] bg-background">
                    <BetaSignupForm />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-white/50">
                Takes under 60 seconds. We’ll respond within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* WHAT YOUR SCHOOL GETS — 8 features from the ad              */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="bg-cream px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
                What your school gets
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-5xl">
                Every school workflow, one platform.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                Skunect replaces the stack of tools your admin team stitches
                together today — spreadsheets, paper registers, WhatsApp groups,
                fee books — with one modern system built for African schools.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item, i) => (
              <Reveal key={item.title} delay={(i % 4) * 80}>
                <div className="group h-full rounded-2xl border border-navy/5 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal/30 hover:shadow-xl hover:shadow-navy/5">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal/10 text-teal transition-colors duration-300 group-hover:bg-teal group-hover:text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* PRODUCT PROOF — admin dashboard + why us                   */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="bg-background px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
            <Reveal direction="left">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
                  Built for school operators
                </p>
                <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
                  Run your school from a single dashboard.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                  Owners see the whole school at a glance — attendance rates,
                  teacher accountability, outstanding fees, parent engagement.
                  Admins stop chasing teachers. Teachers stop chasing parents.
                  Parents stop chasing information.
                </p>
                <ul className="mt-7 space-y-3.5">
                  {whySkunect.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10">
                        <Check className="h-3.5 w-3.5 text-teal" />
                      </div>
                      <span className="text-sm leading-relaxed text-navy/80">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal direction="right" delay={150}>
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-teal/10 via-transparent to-[#D4A843]/10 blur-2xl"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-2xl shadow-navy/10">
                  <Image
                    src="/screenshots/admin-dashboard.png"
                    alt="Skunect admin dashboard — attendance, fees, teacher accountability"
                    width={1280}
                    height={960}
                    className="w-full"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    priority
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* RESEARCH / CREDIBILITY STRIP                                */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="border-y border-navy/5 bg-sage/40 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="relative rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy/5 sm:p-10">
              <Quote
                className="absolute left-6 top-6 h-9 w-9 text-teal/20"
                aria-hidden
              />
              <div className="pl-12">
                <p className="font-display text-xl leading-snug text-navy sm:text-2xl">
                  We spent months sitting with Lagos parents, teachers, and
                  school administrators before we wrote a single line of
                  product code. Skunect is designed around the workflows they
                  actually run — not a template copied from abroad.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-teal/30">
                    <Image
                      src="/founder.jpg"
                      alt="Olaleye Oladejo, Founder of Skunect"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy">
                      Olaleye Oladejo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Founder, Skunect • Lagos, Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* WHAT THE PILOT INCLUDES                                     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="bg-background px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
                What the pilot includes
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-5xl">
                More than early access.
              </h2>
              <p className="mt-5 text-lg text-muted-foreground">
                The Skunect pilot is a real partnership. Here’s what every
                pilot school gets, at zero cost, for the entire beta period.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {pilotIncludes.map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-navy/5 bg-gradient-to-br from-white to-sage/30 p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/5">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-teal">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Pricing transparency */}
          <Reveal delay={200}>
            <div className="mt-14 rounded-2xl border border-dashed border-navy/15 bg-cream/60 p-6 text-center sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">
                Pricing transparency
              </p>
              <p className="mt-3 font-display text-2xl text-navy sm:text-3xl">
                ₦0 during the entire beta.
              </p>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Post-beta pricing is per-student per-month and pilot schools
                keep a permanent founding-school discount. We’ll share the
                exact rate with you on the onboarding call — no surprises, no
                hidden fees.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* FINAL CTA                                                   */}
      {/* ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy px-4 py-24 sm:px-6 sm:py-32">
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(42,157,143,0.18),transparent_65%)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="font-display text-4xl leading-tight tracking-tight text-white sm:text-5xl">
              10 pilot slots. April 30 launch.
              <br />
              <span className="bg-gradient-to-r from-teal to-emerald-300 bg-clip-text text-transparent">
                Is your school one of them?
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/60">
              If you run a private primary or secondary school in Lagos, we’d
              love to have you in the pilot. Apply in under 60 seconds.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-teal px-7 py-4 text-base font-semibold text-white shadow-lg shadow-teal/25 transition-all hover:bg-teal/90 hover:shadow-xl hover:shadow-teal/30"
              >
                Claim your pilot slot
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="https://wa.me/2348038011663?text=Hi%20Skunect%2C%20I%27d%20like%20to%20book%20a%2020-minute%20demo%20for%20my%20school."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-7 py-4 text-base font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/10"
              >
                <MessageSquare className="h-4 w-4" />
                Talk to the founder on WhatsApp
              </a>
            </div>
            <div className="mt-10">
              <BetaCountdown variant="dark" />
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
