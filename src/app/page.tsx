'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  Bell,
  CreditCard,
  ShieldCheck,
  MessageCircle,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuthStore } from '@/lib/stores/auth-store';
import { SiteNavbar } from '@/components/shared/site-navbar';
import { SiteFooter } from '@/components/shared/site-footer';
import { Reveal } from '@/components/shared/scroll-reveal';
import { BLUR_PLACEHOLDER } from '@/lib/utils/constants';

const features = [
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Track attendance, grades, and performance with live dashboards and actionable insights.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Instant alerts for attendance, grades, announcements, and safety events across all channels.',
  },
  {
    icon: CreditCard,
    title: 'Fee Management',
    description:
      'Create fee structures, generate invoices, track payments, and view outstanding balances.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety & Security',
    description:
      'Pickup authorization, emergency alerts, welfare monitoring, and role-based access control.',
  },
  {
    icon: MessageCircle,
    title: 'Direct Messaging',
    description:
      'Real-time messaging between parents, teachers, and administrators with full history.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description:
      'Native apps for parents and teachers — optimized for African networks and busy schedules.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Set Up Your School',
    description:
      'Admins configure classes, subjects, and fee structures. Bulk import students and teachers via CSV. Ready in minutes.',
    screenshot: '/screenshots/admin-settings.png',
    screenshotAlt: 'Admin configuring school settings',
  },
  {
    number: '02',
    title: 'Invite Your Community',
    description:
      "Teachers and parents receive invitations to join. One parent account connects to all their children — even across multiple schools.",
    screenshot: '/screenshots/admin-users.png',
    screenshotAlt: 'Managing users and invitations',
  },
  {
    number: '03',
    title: 'Engage in Real-Time',
    description:
      'Teachers mark attendance and enter grades. Parents see updates instantly on their phone. Messages flow in real-time.',
    screenshot: '/screenshots/teacher-attendance.png',
    screenshotAlt: 'Teacher marking attendance',
  },
];

const faqs = [
  {
    question: 'How does Skunect help parents stay connected?',
    answer:
      "Parents get real-time access to their children's attendance, grades, homework, and fee status through both the mobile app and web platform. They can message teachers directly and receive instant notifications about school events.",
  },
  {
    question: 'What features do teachers get?',
    answer:
      'Teachers can mark digital attendance, enter grades, create and track homework, send messages to parents, record welfare observations, and manage their class schedules — all from one platform.',
  },
  {
    question: 'Is Skunect secure?',
    answer:
      "Yes. We use enterprise-grade security with role-based access control, encrypted data, secure pickup authorization, and multi-tenant isolation so each school's data is completely separate.",
  },
  {
    question: 'How long does it take to set up?',
    answer:
      'Most schools are fully set up within a day. Admins can bulk-import students, teachers, and fee structures via CSV. Our data migration tools make switching from another system seamless.',
  },
  {
    question: 'Can one parent have children in multiple schools?',
    answer:
      "Yes. A single parent account can be linked to children across different schools. Parents simply switch between schools to view each child's information.",
  },
  {
    question: 'What does the beta program include?',
    answer:
      'Beta schools get free access to the full platform, priority support, and a direct feedback channel to shape the product. Apply at skunect.com/beta.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (window.location.pathname !== '/') return;
    if (token) {
      router.replace('/dashboard');
    } else {
      setChecked(true);
    }
  }, [router, token]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* SEO: FAQPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }),
        }}
      />

      <SiteNavbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section id="main-content" className="relative overflow-hidden bg-navy px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        {/* Background mesh gradients */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_40%,rgba(42,157,143,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(212,168,67,0.06),transparent)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            {/* Beta badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-teal/15 px-4 py-1.5 text-sm font-medium text-teal">
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
              Now in Beta — Accepting Schools
            </div>

            <h1 className="mt-8 font-display text-5xl leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Stay Connected to
              <br className="hidden sm:block" />
              {' Your Child\u2019s '}
              <span className="bg-gradient-to-r from-teal to-emerald-400 bg-clip-text text-transparent">
                Education
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60 sm:text-xl">
              Real-time attendance, grades, messaging, and payments — one
              platform built for African schools.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/beta">
                <Button
                  size="lg"
                  className="bg-teal text-white hover:bg-teal/90"
                >
                  Join the Beta
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link
                href="/features"
                className="inline-flex h-11 items-center justify-center rounded-md border border-white/25 bg-transparent px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Explore Features
              </Link>
            </div>
          </div>

          {/* Dashboard preview */}
          <Reveal className="mx-auto mt-20 max-w-5xl">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl shadow-teal/5">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <span className="ml-2 text-xs text-white/30">
                  app.skunect.com
                </span>
              </div>
              <Image
                src="/screenshots/admin-dashboard.png"
                alt="Skunect Admin Dashboard"
                width={1280}
                height={720}
                className="w-full"
                priority
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="bg-cream px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
                Everything Your School Needs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                One platform for academics, communication, safety, and
                payments — designed for how African schools operate.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 80}>
                <div className="group h-full rounded-2xl border bg-white p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal transition-colors duration-300 group-hover:bg-teal group-hover:text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 text-center">
            <Link href="/features">
              <Button variant="outline" size="lg">
                See All Features
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
                Up and Running in Three Steps
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get your school connected in minutes, not months.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto mt-20 max-w-5xl space-y-20 lg:space-y-28">
            {steps.map((step, i) => {
              const isReversed = i % 2 === 1;
              return (
                <div
                  key={step.number}
                  className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                    isReversed ? 'lg:[direction:rtl]' : ''
                  }`}
                >
                  <Reveal direction={isReversed ? 'right' : 'left'}>
                    <div className={isReversed ? 'lg:[direction:ltr]' : ''}>
                      <span className="font-display text-6xl text-teal/20 sm:text-7xl">
                        {step.number}
                      </span>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight">
                        {step.title}
                      </h3>
                      <p className="mt-3 leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </Reveal>

                  <Reveal
                    direction={isReversed ? 'left' : 'right'}
                    delay={150}
                  >
                    <div
                      className={`overflow-hidden rounded-xl border shadow-lg ${
                        isReversed ? 'lg:[direction:ltr]' : ''
                      }`}
                    >
                      <Image
                        src={step.screenshot}
                        alt={step.screenshotAlt}
                        width={1280}
                        height={720}
                        className="w-full"
                        placeholder="blur"
                        blurDataURL={BLUR_PLACEHOLDER}
                      />
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Mobile Showcase ──────────────────────────────────────── */}
      <section className="overflow-hidden bg-sage/40 px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
                Always Connected on Mobile
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Native apps for parents and teachers — optimized for African
                networks.
              </p>
            </div>
          </Reveal>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {[
              {
                src: '/screenshots/mobile/parent-home.png',
                label: 'Parent Home',
                rotate: '-rotate-2',
              },
              {
                src: '/screenshots/mobile/parent-academics.png',
                label: 'Academics',
                rotate: 'rotate-1',
              },
              {
                src: '/screenshots/mobile/teacher-home.png',
                label: 'Teacher Home',
                rotate: '-rotate-1',
              },
              {
                src: '/screenshots/mobile/teacher-classes.png',
                label: 'Classes',
                rotate: 'rotate-2',
              },
            ].map((phone, i) => (
              <Reveal key={phone.label} delay={i * 100}>
                <div
                  className={`${phone.rotate} transition-transform duration-300 hover:rotate-0 hover:scale-105`}
                >
                  <div className="overflow-hidden rounded-[2rem] border-4 border-navy/80 bg-navy shadow-xl">
                    {/* Phone notch */}
                    <div className="mx-auto h-5 w-20 rounded-b-xl bg-navy" />
                    <Image
                      src={phone.src}
                      alt={phone.label}
                      width={390}
                      height={844}
                      className="w-full"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                    />
                  </div>
                  <p className="mt-3 text-center text-sm font-medium text-muted-foreground">
                    {phone.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section id="faq" className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="text-center">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to know about Skunect.
              </p>
            </div>
          </Reveal>

          <Reveal className="mt-12" delay={100}>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-20 text-center sm:px-12 sm:py-28">
              {/* Background gradient accent */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(42,157,143,0.15),transparent_70%)]" />

              <div className="relative z-10">
                <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Ready to Transform Your School?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
                  Join schools across Lagos already using Skunect to connect
                  parents, teachers, and administrators.
                </p>
                <div className="mt-10">
                  <Link href="/beta">
                    <Button
                      size="lg"
                      className="bg-teal text-white hover:bg-teal/90"
                    >
                      Apply for Beta Access
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
