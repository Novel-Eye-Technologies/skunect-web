'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  BarChart3,
  Bell,
  CreditCard,
  ShieldCheck,
  MessageCircle,
  Smartphone,
  Users,
  ChevronRight,
  Check,
  Star,
  School,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuthStore } from '@/lib/stores/auth-store';

const features = [
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Track attendance, grades, and performance with live dashboards and actionable insights.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description:
      'Instant alerts for attendance, grades, announcements, and safety events across all channels.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: CreditCard,
    title: 'Payment Integration',
    description:
      'Manage fee structures, generate invoices, track payments, and view outstanding balances.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: ShieldCheck,
    title: 'Security & Privacy',
    description:
      'Enterprise-grade security with role-based access, pickup authorization, and emergency alerts.',
    gradient: 'from-red-500 to-rose-600',
  },
  {
    icon: MessageCircle,
    title: 'Direct Messaging',
    description:
      'Real-time messaging between parents, teachers, and admins with conversation history.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description:
      'Native mobile apps for parents and teachers — stay connected from anywhere, anytime.',
    gradient: 'from-cyan-500 to-blue-600',
  },
];

const steps = [
  {
    number: '01',
    title: 'School Setup',
    description:
      'Admins configure the school — add classes, subjects, fee structures, and invite teachers. Everything is ready in minutes.',
    icon: School,
    screenshot: '/screenshots/admin-settings.png',
    screenshotAlt: 'Admin configuring school settings',
  },
  {
    number: '02',
    title: 'Parent Invitation',
    description:
      'Parents receive invitations to join their child\'s school. One account connects them to all their children across multiple schools.',
    icon: Users,
    screenshot: '/screenshots/admin-users.png',
    screenshotAlt: 'Managing users and parent invitations',
  },
  {
    number: '03',
    title: 'Real-Time Engagement',
    description:
      'Teachers mark attendance, enter grades, and assign homework. Parents see updates instantly on their phone.',
    icon: BarChart3,
    screenshot: '/screenshots/teacher-attendance.png',
    screenshotAlt: 'Teacher marking attendance in real-time',
  },
];

const whySkunect = [
  'Built specifically for African schools — not a retrofitted Western tool',
  'Parents see attendance, grades, and fees in real-time',
  'Teachers save hours with digital attendance and grading',
  'Admins get complete school oversight from one dashboard',
  'Secure pickup authorization protects every child',
  'Works on mobile — perfect for busy parents on the go',
];

const faqs = [
  {
    question: 'How does Skunect help parents stay connected?',
    answer:
      'Parents get real-time access to their children\'s attendance, grades, homework, and fee status through both the mobile app and web platform. They can message teachers directly and receive instant notifications about school events and safety alerts.',
  },
  {
    question: 'What features do teachers get?',
    answer:
      'Teachers can mark digital attendance, enter grades, create and track homework assignments, send messages to parents, record welfare observations, and manage their class schedules — all from one platform.',
  },
  {
    question: 'Is Skunect secure?',
    answer:
      'Absolutely. We use enterprise-grade security with role-based access control, encrypted data, secure pickup authorization, and multi-tenant isolation so each school\'s data is completely separate.',
  },
  {
    question: 'How long does it take to set up?',
    answer:
      'Most schools are fully set up within a day. Admins can bulk-import students, teachers, and fee structures via CSV. Our data migration tools make switching from another system seamless.',
  },
  {
    question: 'Can one parent have children in multiple schools?',
    answer:
      'Yes! A single parent account can be linked to children across different schools. Parents simply switch between schools to view each child\'s information.',
  },
  {
    question: 'Does Skunect work offline?',
    answer:
      'The mobile app is optimized for low-bandwidth environments common in Africa. While real-time features need connectivity, the app is designed to work efficiently even on slower networks.',
  },
];

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

export default function HomePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [checked, setChecked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Skunect</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Get Started
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-background px-4 pb-4 pt-2 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block py-2 text-sm font-medium text-muted-foreground"
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
              <Link href="/register">
                <Button size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #2A9D8F 1px, transparent 1px),
                radial-gradient(circle at 75% 75%, #2A9D8F 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy to-navy/95" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Stay Connected to Your Child&apos;s{' '}
              <span className="bg-gradient-to-r from-teal to-emerald-400 bg-clip-text text-transparent">
                Education
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Skunect bridges the gap between schools and parents. Real-time
              attendance, grades, messaging, and payments — all in one platform
              built for African schools.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-teal text-white hover:bg-teal/90"
                >
                  Get Started Free
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 bg-[#1C2B49]"
                >
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50 sm:gap-10">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-teal" />
                <span>500+ Schools</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-teal" />
                <span>50,000+ Parents</span>
              </div>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                <div className="h-3 w-3 rounded-full bg-green-400/60" />
                <span className="ml-2 text-xs text-white/40">
                  app.skunect.com/dashboard
                </span>
              </div>
              <Image
                src="/screenshots/admin-dashboard.png"
                alt="Skunect Admin Dashboard"
                width={1280}
                height={720}
                className="w-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything Your School Needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One platform to manage academics, communication, safety, and
              payments — designed specifically for how African schools operate.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-sm`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/features">
              <Button variant="outline" size="lg">
                See All Features
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-y bg-muted/30 px-4 py-20 sm:px-6 sm:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Get your school up and running in three simple steps.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-4xl">
            <div className="relative">
              {/* Vertical line connecting steps */}
              <div className="absolute left-6 top-0 block h-full w-px bg-border" />

              <div className="space-y-12 sm:space-y-16">
                {steps.map((step, index) => (
                  <div key={step.number} className="relative flex gap-6">
                    {/* Step number circle */}
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white shadow-md">
                      {step.number}
                    </div>
                    <div className="pt-1.5">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="mt-2 text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                      {/* Step screenshot */}
                      {step.screenshot && (
                        <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-sm">
                          <Image
                            src={step.screenshot}
                            alt={step.screenshotAlt}
                            width={1280}
                            height={720}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy to-[#1a3a5c] px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Transform Your School?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
                Join hundreds of schools across Africa already using Skunect to
                connect parents, teachers, and administrators.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-teal text-white hover:bg-teal/90"
                  >
                    Start Free Trial
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white pointer-events-none opacity-50"
                  aria-disabled="true"
                >
                  Contact Sales (Coming Soon)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Skunect */}
      <section className="border-t bg-muted/30 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why Schools Choose Skunect
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Purpose-built for the unique needs of African schools — not
                another generic tool adapted from a different market.
              </p>
              <ul className="mt-8 space-y-4">
                {whySkunect.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10">
                      <Check className="h-3.5 w-3.5 text-teal" />
                    </div>
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Parent dashboard screenshot */}
            <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
              <Image
                src="/screenshots/parent-dashboard.png"
                alt="Skunect Parent Dashboard"
                width={1280}
                height={960}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Showcase */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Always Connected on Mobile
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Native mobile apps for parents and teachers — optimized for African
              networks so you stay connected wherever you are.
            </p>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            {/* Parent Mobile */}
            <div>
              <h3 className="mb-2 text-xl font-semibold">For Parents</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Track attendance, grades, fees, and message teachers — all from your phone.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-2xl border shadow-sm">
                  <Image
                    src="/screenshots/mobile/parent-home.png"
                    alt="Parent home screen"
                    width={390}
                    height={844}
                    className="w-full"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border shadow-sm">
                  <Image
                    src="/screenshots/mobile/parent-academics.png"
                    alt="Parent academics screen"
                    width={390}
                    height={844}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Teacher Mobile */}
            <div>
              <h3 className="mb-2 text-xl font-semibold">For Teachers</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Manage classes, mark attendance, and communicate with parents on the go.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-2xl border shadow-sm">
                  <Image
                    src="/screenshots/mobile/teacher-home.png"
                    alt="Teacher home screen"
                    width={390}
                    height={844}
                    className="w-full"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border shadow-sm">
                  <Image
                    src="/screenshots/mobile/teacher-classes.png"
                    alt="Teacher classes screen"
                    width={390}
                    height={844}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about Skunect.
            </p>
          </div>

          <div className="mt-12">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-navy px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/20">
                  <GraduationCap className="h-5 w-5 text-teal" />
                </div>
                <span className="text-xl font-bold text-white">Skunect</span>
              </div>
              <p className="mt-3 max-w-xs text-sm text-white/50 leading-relaxed">
                School Management & Parent Engagement Platform — connecting
                schools and families across Africa.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white/80">
                Product
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/features"
                    className="text-sm text-white/40 transition-colors hover:text-white/70"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/beta"
                    className="text-sm text-white/40 transition-colors hover:text-white/70"
                  >
                    Beta Program
                  </Link>
                </li>
                {[
                  { label: 'For Schools' },
                  { label: 'For Parents' },
                  { label: 'Pricing' },
                ].map((link) => (
                  <li key={link.label}>
                    <span
                      aria-disabled="true"
                      className="text-sm text-white/40 pointer-events-none opacity-50"
                    >
                      {link.label}{' '}
                      <span className="text-[10px] text-white/30">
                        (Coming Soon)
                      </span>
                    </span>
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
                {[
                  { label: 'About Us' },
                  { label: 'Blog' },
                  { label: 'Careers' },
                  { label: 'Contact' },
                ].map((link) => (
                  <li key={link.label}>
                    <span
                      aria-disabled="true"
                      className="text-sm text-white/40 pointer-events-none opacity-50"
                    >
                      {link.label}{' '}
                      <span className="text-[10px] text-white/30">
                        (Coming Soon)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white/80">
                Support
              </h4>
              <ul className="space-y-2">
                {[
                  { label: 'Help Center' },
                  { label: 'Privacy Policy' },
                  { label: 'Terms of Service' },
                ].map((link) => (
                  <li key={link.label}>
                    <span
                      aria-disabled="true"
                      className="text-sm text-white/40 pointer-events-none opacity-50"
                    >
                      {link.label}{' '}
                      <span className="text-[10px] text-white/30">
                        (Coming Soon)
                      </span>
                    </span>
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
    </div>
  );
}
