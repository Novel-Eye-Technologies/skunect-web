'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  ChevronRight,
  Users,
  BookOpen,
  ClipboardCheck,
  MessageCircle,
  CreditCard,
  ShieldCheck,
  Bell,
  Bus,
  Settings,
  Heart,
  Smartphone,
  TrendingUp,
  Home,
  Upload,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Tiny 1x1 pixel base64 placeholder for blur effect on images
// ---------------------------------------------------------------------------
const BLUR_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk2iLajgAAAABJRU5ErkJggg==';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type RoleTab = 'admin' | 'teacher' | 'parent';

interface FeatureSection {
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
  screenshotLabel: string;
  screenshot: string;
}

const roleInfo: Record<
  RoleTab,
  { label: string; tagline: string; gradient: string }
> = {
  admin: {
    label: 'School Admins',
    tagline: 'Complete school management from one dashboard',
    gradient: 'from-navy to-[#2a4a7a]',
  },
  teacher: {
    label: 'Teachers',
    tagline: 'Focus on teaching — let Skunect handle the rest',
    gradient: 'from-teal to-emerald-600',
  },
  parent: {
    label: 'Parents',
    tagline: "Stay involved in your child's education, effortlessly",
    gradient: 'from-amber-500 to-orange-600',
  },
};

const adminFeatures: FeatureSection[] = [
  {
    icon: Home,
    title: 'Dashboard & Analytics',
    description:
      'Get a bird\'s-eye view of your entire school. See total students, teachers, attendance rates, and fees collected at a glance. Weekly attendance charts and activity feeds keep you informed of everything happening in your school.',
    highlights: [
      'Real-time attendance tracking across all classes',
      'Fee collection summaries and outstanding balances',
      'Activity feed showing attendance, grades, and announcements',
      'Weekly and monthly trend charts',
    ],
    screenshotLabel: 'Admin Dashboard',
    screenshot: '/screenshots/admin-dashboard.png',
  },
  {
    icon: Users,
    title: 'People Management',
    description:
      'Manage every person connected to your school. Add teachers and staff, invite parents, enroll students, and control access — all from one place. Bulk import via CSV makes onboarding hundreds of students effortless.',
    highlights: [
      'Add and manage teachers, parents, and admin staff',
      'Bulk student enrollment via CSV import',
      'Role-based access control for every user',
      'Student lifecycle management (active, graduated, transferred)',
    ],
    screenshotLabel: 'People Management',
    screenshot: '/screenshots/admin-users.png',
  },
  {
    icon: BookOpen,
    title: 'Academic Configuration',
    description:
      'Set up your academic structure once and let Skunect handle the rest. Create classes, define subjects, configure grading systems, and manage academic sessions and terms.',
    highlights: [
      'Academic session and term management',
      'Class and section configuration',
      'Subject management with class assignments',
      'Custom grading systems and scales',
    ],
    screenshotLabel: 'Academic Settings',
    screenshot: '/screenshots/admin-settings.png',
  },
  {
    icon: CreditCard,
    title: 'Fee Management',
    description:
      'Create fee structures by class and term, generate invoices in bulk, and track every payment. See who has paid, who hasn\'t, and how much is outstanding — with full payment history for each student.',
    highlights: [
      'Create fee structures per class and term',
      'Bulk invoice generation',
      'Track payment status (pending, partial, paid, overdue)',
      'Detailed payment history and balance summaries',
    ],
    screenshotLabel: 'Fee Management',
    screenshot: '/screenshots/admin-fees.png',
  },
  {
    icon: ShieldCheck,
    title: 'Safety & Security',
    description:
      'Protect your students with comprehensive safety tools. Create emergency alerts with severity levels, manage authorized pickup persons, and monitor student welfare through mood tracking and health records.',
    highlights: [
      'Emergency alert system (lockdown, evacuation, medical)',
      'Pickup authorization management',
      'Welfare logs and incident tracking',
      'Student mood tracking and health records',
    ],
    screenshotLabel: 'Safety Dashboard',
    screenshot: '/screenshots/admin-safety.png',
  },
  {
    icon: Bus,
    title: 'Bus Management',
    description:
      'Manage your entire school transport system. Create bus routes, register vehicles, enroll students in routes, and schedule trips. Track trip status and ensure every child gets home safely.',
    highlights: [
      'Route creation and management',
      'Bus registration and driver assignment',
      'Student enrollment in routes',
      'Trip scheduling and status tracking',
    ],
    screenshotLabel: 'Bus Management',
    screenshot: '/screenshots/admin-bus.png',
  },
  {
    icon: Upload,
    title: 'Data Migration',
    description:
      'Switching from another system? Import your existing data seamlessly. Bulk upload students, teachers, classes, subjects, and fee structures via CSV templates.',
    highlights: [
      'CSV templates for every data type',
      'Bulk import students and teachers',
      'Import classes, subjects, and fee structures',
      'Validation and error reporting',
    ],
    screenshotLabel: 'Data Migration',
    screenshot: '/screenshots/admin-students.png',
  },
];

const teacherFeatures: FeatureSection[] = [
  {
    icon: Home,
    title: 'Teacher Dashboard',
    description:
      'Start every day with a clear picture. See your today\'s attendance rate, pending homework, recent submissions, and quick-action cards to take attendance, enter grades, or create homework.',
    highlights: [
      'Quick action cards for daily tasks',
      'Today\'s attendance rate across all classes',
      'Pending homework with approaching deadlines',
      'Recent student submissions overview',
    ],
    screenshotLabel: 'Teacher Dashboard',
    screenshot: '/screenshots/teacher-dashboard.png',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance Management',
    description:
      'Mark attendance in seconds with the intuitive grid interface. Select a class, mark each student as present, absent, or late, and submit. Parents are notified instantly. View attendance history and trends for any class.',
    highlights: [
      'Grid-based marking interface per class',
      'Mark present, absent, or late',
      'Automatic parent notification on submission',
      'Historical attendance data and trends',
    ],
    screenshotLabel: 'Attendance Marking',
    screenshot: '/screenshots/teacher-attendance.png',
  },
  {
    icon: BookOpen,
    title: 'Homework & Grading',
    description:
      'Create homework assignments, set due dates, and track which students have submitted. Enter grades for assessments and see submission rates at a glance. Filter by class, subject, or status.',
    highlights: [
      'Create and assign homework with due dates',
      'Track submission rates per assignment',
      'Enter grades for continuous assessment and exams',
      'Filter by class, subject, and status',
    ],
    screenshotLabel: 'Homework Tracking',
    screenshot: '/screenshots/teacher-homework.png',
  },
  {
    icon: MessageCircle,
    title: 'Parent Communication',
    description:
      'Message parents directly about their child\'s progress, behavior, or any concerns. Real-time messaging with full conversation history means no message gets lost.',
    highlights: [
      'Direct messaging with parents and admins',
      'Real-time message delivery via WebSocket',
      'Full conversation history',
      'Unread message indicators',
    ],
    screenshotLabel: 'Messaging',
    screenshot: '/screenshots/teacher-messages.png',
  },
  {
    icon: Heart,
    title: 'Student Welfare',
    description:
      'Record welfare observations, track student mood patterns, manage health records, and verify authorized pickups. Keep a complete picture of each student\'s well-being.',
    highlights: [
      'Record welfare notes and incidents',
      'Monitor student mood patterns',
      'Manage health records and conditions',
      'Verify authorized pickups at dismissal',
    ],
    screenshotLabel: 'Welfare Tracking',
    screenshot: '/screenshots/teacher-welfare.png',
  },
];

const parentFeatures: FeatureSection[] = [
  {
    icon: Home,
    title: 'Parent Dashboard',
    description:
      'See everything about your child in one place. Attendance rate, recent grades, outstanding fees, homework status, and mood — updated in real-time so you\'re always in the loop.',
    highlights: [
      'Real-time attendance status and history',
      'Latest grades and assessment scores',
      'Outstanding fee balances',
      'Homework submission tracking',
    ],
    screenshotLabel: 'Parent Dashboard',
    screenshot: '/screenshots/parent-dashboard.png',
  },
  {
    icon: TrendingUp,
    title: 'Academic Progress',
    description:
      'Track your child\'s academic journey. View grades for every subject, monitor continuous assessment scores, and see how their performance trends over time. Never miss a homework deadline.',
    highlights: [
      'Subject-by-subject grade tracking',
      'Assessment scores (CA1, CA2, CA3, exams)',
      'Performance trends over terms',
      'Homework assignments and due dates',
    ],
    screenshotLabel: 'Academic Progress',
    screenshot: '/screenshots/parent-homework.png',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance Monitoring',
    description:
      'Know if your child made it to school — in real-time. Get notified the moment attendance is marked. View daily status, absence and tardiness records, and historical attendance logs.',
    highlights: [
      'Real-time attendance notifications',
      'Daily present/absent/late status',
      'Absence and tardiness tracking',
      'Historical attendance logs and trends',
    ],
    screenshotLabel: 'Attendance History',
    screenshot: '/screenshots/parent-attendance.png',
  },
  {
    icon: CreditCard,
    title: 'Fee Tracking',
    description:
      'View all fee invoices, check outstanding balances, and see payment history. Know exactly what\'s been paid and what\'s due — no more guessing or chasing paper receipts.',
    highlights: [
      'View all invoices and fee details',
      'Check outstanding balances',
      'Full payment history',
      'Status tracking (paid, pending, overdue)',
    ],
    screenshotLabel: 'Fee Invoices',
    screenshot: '/screenshots/parent-fees.png',
  },
  {
    icon: MessageCircle,
    title: 'Teacher Messaging',
    description:
      'Message your child\'s teacher directly from the app. Discuss progress, ask questions, or flag concerns — with full conversation history so nothing gets lost.',
    highlights: [
      'Direct messaging with teachers and admin',
      'Real-time message delivery',
      'Full conversation history',
      'Push notifications for new messages',
    ],
    screenshotLabel: 'Messaging',
    screenshot: '/screenshots/parent-messages.png',
  },
  {
    icon: ShieldCheck,
    title: 'Safety & Pickup',
    description:
      'Manage who is authorized to pick up your child. Add family members or guardians, specify relationships, and have peace of mind knowing the school verifies every pickup.',
    highlights: [
      'Manage authorized pickup contacts',
      'Specify relationship to child',
      'School verifies every pickup',
      'Bus tracking for enrolled students',
    ],
    screenshotLabel: 'Pickup Authorization',
    screenshot: '/screenshots/parent-pickup.png',
  },
];

const featuresByRole: Record<RoleTab, FeatureSection[]> = {
  admin: adminFeatures,
  teacher: teacherFeatures,
  parent: parentFeatures,
};

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'FAQ', href: '/#faq' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeaturesPage() {
  const [activeRole, setActiveRole] = useState<RoleTab>('admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentFeatures = featuresByRole[activeRole];
  const currentRole = roleInfo[activeRole];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Skunect</span>
          </Link>

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

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy px-4 py-16 text-center sm:px-6 sm:py-24">
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
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-teal to-emerald-400 bg-clip-text text-transparent">
              Every Role
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Whether you&apos;re managing a school, teaching a class, or tracking
            your child&apos;s progress — Skunect gives you exactly the tools you
            need.
          </p>
        </div>
      </section>

      {/* Role Tabs */}
      <section className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            {(Object.keys(roleInfo) as RoleTab[]).map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`relative px-6 py-4 text-sm font-medium transition-colors sm:px-8 ${
                  activeRole === role
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {roleInfo[role].label}
                {activeRole === role && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Role Tagline */}
      <section
        className={`bg-gradient-to-r ${currentRole.gradient} px-4 py-10 text-center sm:px-6 sm:py-14`}
      >
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {currentRole.tagline}
        </h2>
      </section>

      {/* Feature Sections — alternating layout */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl space-y-24 lg:space-y-32">
          {currentFeatures.map((feature, index) => {
            const isReversed = index % 2 === 1;
            return (
              <div
                key={feature.title}
                className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                  isReversed ? 'lg:[direction:rtl]' : ''
                }`}
              >
                {/* Text */}
                <div className={isReversed ? 'lg:[direction:ltr]' : ''}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10 text-teal">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {feature.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3 text-sm">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/10">
                          <ChevronRight className="h-3 w-3 text-teal" />
                        </div>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Screenshot */}
                <div
                  className={`overflow-hidden rounded-2xl border bg-muted/30 shadow-sm ${
                    isReversed ? 'lg:[direction:ltr]' : ''
                  }`}
                >
                  <Image
                    src={feature.screenshot}
                    alt={feature.screenshotLabel}
                    width={1280}
                    height={960}
                    className="w-full"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cross-platform section */}
      <section className="border-y bg-muted/30 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Available Everywhere
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Access Skunect from any device. The web app provides full
            functionality for admins, while native mobile apps keep teachers and
            parents connected on the go.
          </p>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Settings,
                title: 'Web Dashboard',
                description:
                  'Full-featured web app for school admins, teachers, and parents. Works on any browser.',
                label: 'Desktop / Laptop',
              },
              {
                icon: Smartphone,
                title: 'Mobile App',
                description:
                  'Native mobile apps for parents and teachers. Optimized for speed on African networks.',
                label: 'iOS / Android',
              },
              {
                icon: Bell,
                title: 'Real-Time Notifications',
                description:
                  'Push notifications, in-app alerts, and email notifications so you never miss an update.',
                label: 'Always Connected',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border bg-card p-8 text-center transition-shadow hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-white">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs font-medium text-teal">
                  {item.label}
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile App Screenshots */}
          <div className="mt-16">
            <h3 className="mb-8 text-center text-xl font-semibold">
              Mobile App Preview
            </h3>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { src: '/screenshots/mobile/parent-home.png', label: 'Parent Home' },
                { src: '/screenshots/mobile/parent-academics.png', label: 'Parent Academics' },
                { src: '/screenshots/mobile/teacher-home.png', label: 'Teacher Home' },
                { src: '/screenshots/mobile/teacher-classes.png', label: 'Teacher Classes' },
              ].map((screenshot) => (
                <div key={screenshot.label} className="text-center">
                  <div className="overflow-hidden rounded-2xl border shadow-sm">
                    <Image
                      src={screenshot.src}
                      alt={screenshot.label}
                      width={390}
                      height={844}
                      className="w-full"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    {screenshot.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-navy to-[#1a3a5c] px-6 py-16 text-center sm:px-12 sm:py-20">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
              Join hundreds of schools already transforming how they connect with
              parents and manage daily operations.
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
      </section>

      {/* Footer */}
      <footer className="border-t bg-navy px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/20">
                  <GraduationCap className="h-5 w-5 text-teal" />
                </div>
                <span className="text-xl font-bold text-white">Skunect</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm text-white/50 leading-relaxed">
                School Management & Parent Engagement Platform — connecting
                schools and families across Africa.
              </p>
            </div>

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
