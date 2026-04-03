'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRight,
  Check,
  Users,
  BookOpen,
  ClipboardCheck,
  MessageCircle,
  CreditCard,
  ShieldCheck,
  Bell,
  Heart,
  Smartphone,
  TrendingUp,
  Home,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteNavbar } from '@/components/shared/site-navbar';
import { SiteFooter } from '@/components/shared/site-footer';
import { Reveal } from '@/components/shared/scroll-reveal';
import { BLUR_PLACEHOLDER } from '@/lib/utils/constants';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type RoleTab = 'admin' | 'teacher' | 'parent';

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
  screenshot: string;
  screenshotLabel: string;
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
    tagline: 'Focus on teaching \u2014 let Skunect handle the rest',
    gradient: 'from-teal to-emerald-600',
  },
  parent: {
    label: 'Parents',
    tagline: "Stay involved in your child\u2019s education, effortlessly",
    gradient: 'from-amber-warm to-amber-600',
  },
};

const adminFeatures: FeatureCard[] = [
  {
    icon: Home,
    title: 'Dashboard & Analytics',
    description:
      'Bird\u2019s-eye view of your entire school. Real-time attendance, fee summaries, activity feeds, and weekly trend charts.',
    highlights: [
      'Real-time attendance tracking across all classes',
      'Fee collection summaries and outstanding balances',
      'Activity feed for attendance, grades, and announcements',
      'Weekly and monthly trend charts',
    ],
    screenshotLabel: 'Admin Dashboard',
    screenshot: '/screenshots/admin-dashboard.png',
  },
  {
    icon: Users,
    title: 'People Management',
    description:
      'Add teachers, invite parents, enroll students, and control access. Bulk CSV import makes onboarding hundreds effortless.',
    highlights: [
      'Bulk student enrollment via CSV import',
      'Role-based access control for every user',
      'Student lifecycle management',
      'Teacher and staff administration',
    ],
    screenshotLabel: 'People Management',
    screenshot: '/screenshots/admin-users.png',
  },
  {
    icon: CreditCard,
    title: 'Fee Management',
    description:
      'Create fee structures by class and term, generate invoices in bulk, and track every payment with full history.',
    highlights: [
      'Fee structures per class and term',
      'Bulk invoice generation',
      'Payment status tracking',
      'Detailed payment history',
    ],
    screenshotLabel: 'Fee Management',
    screenshot: '/screenshots/admin-fees.png',
  },
  {
    icon: ShieldCheck,
    title: 'Safety & Security',
    description:
      'Emergency alerts with severity levels, authorized pickup management, welfare tracking, and student health records.',
    highlights: [
      'Emergency alert system',
      'Pickup authorization management',
      'Welfare logs and incident tracking',
      'Student mood and health records',
    ],
    screenshotLabel: 'Safety Dashboard',
    screenshot: '/screenshots/admin-safety.png',
  },
  {
    icon: BookOpen,
    title: 'Academic Configuration',
    description:
      'Academic sessions, terms, classes, subjects, and grading systems \u2014 set up once, manage effortlessly.',
    highlights: [
      'Academic session and term management',
      'Class and section configuration',
      'Subject management with class assignments',
      'Custom grading systems',
    ],
    screenshotLabel: 'Academic Settings',
    screenshot: '/screenshots/admin-settings.png',
  },
];

const teacherFeatures: FeatureCard[] = [
  {
    icon: ClipboardCheck,
    title: 'Attendance Management',
    description:
      'Mark attendance in seconds with the grid interface. Parents are notified instantly. View history and trends for any class.',
    highlights: [
      'Grid-based marking per class',
      'Mark present, absent, or late',
      'Automatic parent notification',
      'Historical data and trends',
    ],
    screenshotLabel: 'Attendance Marking',
    screenshot: '/screenshots/teacher-attendance.png',
  },
  {
    icon: BookOpen,
    title: 'Homework & Grading',
    description:
      'Create assignments, set due dates, track submissions, and enter grades for assessments. Filter by class, subject, or status.',
    highlights: [
      'Assignments with due dates',
      'Submission rate tracking',
      'Continuous assessment grading',
      'Filter by class and subject',
    ],
    screenshotLabel: 'Homework Tracking',
    screenshot: '/screenshots/teacher-homework.png',
  },
  {
    icon: MessageCircle,
    title: 'Parent Communication',
    description:
      'Message parents directly about progress, behavior, or concerns. Real-time delivery with full conversation history.',
    highlights: [
      'Direct messaging with parents',
      'Real-time WebSocket delivery',
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
      'Record welfare observations, track mood patterns, manage health records, and verify authorized pickups at dismissal.',
    highlights: [
      'Welfare notes and incidents',
      'Student mood patterns',
      'Health records management',
      'Pickup verification',
    ],
    screenshotLabel: 'Welfare Tracking',
    screenshot: '/screenshots/teacher-welfare.png',
  },
];

const parentFeatures: FeatureCard[] = [
  {
    icon: Home,
    title: 'Parent Dashboard',
    description:
      'See everything about your child in one place \u2014 attendance, grades, fees, homework, and mood \u2014 updated in real-time.',
    highlights: [
      'Real-time attendance status',
      'Latest grades and scores',
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
      'Track grades for every subject, monitor continuous assessment scores, and see performance trends over time.',
    highlights: [
      'Subject-by-subject grade tracking',
      'CA scores and exam results',
      'Performance trends over terms',
      'Homework and due dates',
    ],
    screenshotLabel: 'Academic Progress',
    screenshot: '/screenshots/parent-homework.png',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance Monitoring',
    description:
      'Know if your child made it to school in real-time. View daily status, absence records, and historical logs.',
    highlights: [
      'Real-time notifications',
      'Daily present/absent/late status',
      'Absence and tardiness tracking',
      'Historical attendance logs',
    ],
    screenshotLabel: 'Attendance History',
    screenshot: '/screenshots/parent-attendance.png',
  },
  {
    icon: MessageCircle,
    title: 'Teacher Messaging',
    description:
      'Message your child\u2019s teacher directly. Discuss progress, ask questions, or flag concerns with full history.',
    highlights: [
      'Direct messaging with teachers',
      'Real-time message delivery',
      'Full conversation history',
      'Push notifications',
    ],
    screenshotLabel: 'Messaging',
    screenshot: '/screenshots/parent-messages.png',
  },
];

const featuresByRole: Record<RoleTab, FeatureCard[]> = {
  admin: adminFeatures,
  teacher: teacherFeatures,
  parent: parentFeatures,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeaturesPage() {
  const [activeRole, setActiveRole] = useState<RoleTab>('admin');

  const currentFeatures = featuresByRole[activeRole];
  const currentRole = roleInfo[activeRole];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />

      {/* ── Hero ── */}
      <section id="main-content" className="relative overflow-hidden bg-navy px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_40%,rgba(42,157,143,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(212,168,67,0.06),transparent)]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="font-display text-4xl tracking-tight text-white sm:text-5xl lg:text-6xl">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-teal to-emerald-400 bg-clip-text text-transparent">
              Every Role
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Whether you&apos;re managing a school, teaching a class, or tracking
            your child&apos;s progress — Skunect gives you exactly the tools you
            need.
          </p>
        </div>
      </section>

      {/* ── Role Tabs ── */}
      <section className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center" role="tablist" aria-label="Features by role">
            {(Object.keys(roleInfo) as RoleTab[]).map((role) => (
              <button
                key={role}
                role="tab"
                aria-selected={activeRole === role}
                aria-controls={`tabpanel-${role}`}
                id={`tab-${role}`}
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

      {/* ── Role Tagline ── */}
      <section
        className={`bg-gradient-to-r ${currentRole.gradient} px-4 py-10 text-center sm:px-6 sm:py-14`}
      >
        <h2 className="font-display text-2xl text-white sm:text-3xl">
          {currentRole.tagline}
        </h2>
      </section>

      {/* ── Feature Cards ── */}
      <section className="bg-cream px-4 py-20 sm:px-6 sm:py-28">
        <div
          key={activeRole}
          role="tabpanel"
          id={`tabpanel-${activeRole}`}
          aria-labelledby={`tab-${activeRole}`}
          className="animate-fade-in mx-auto max-w-7xl"
        >
          <div className="grid gap-8 sm:grid-cols-2">
            {currentFeatures.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 60}>
                <div className="group h-full overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 hover:shadow-lg">
                  {/* Screenshot */}
                  <div className="overflow-hidden bg-muted">
                    <Image
                      src={feature.screenshot}
                      alt={feature.screenshotLabel}
                      width={1280}
                      height={800}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                    />
                  </div>
                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                    <ul className="mt-4 grid gap-2">
                      {feature.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cross-Platform ── */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl text-center">
          <Reveal>
            <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
              Available Everywhere
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Full-featured web app for admins. Native mobile apps for teachers
              and parents. Real-time notifications on every device.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Settings,
                title: 'Web Dashboard',
                description:
                  'Full-featured web app for school admins, teachers, and parents.',
                label: 'Desktop / Laptop',
              },
              {
                icon: Smartphone,
                title: 'Mobile App',
                description:
                  'Native apps for parents and teachers, optimized for African networks.',
                label: 'iOS / Android',
              },
              {
                icon: Bell,
                title: 'Real-Time Alerts',
                description:
                  'Push notifications, in-app alerts, and email so you never miss an update.',
                label: 'Always Connected',
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="h-full rounded-2xl border bg-card p-8 text-center transition-shadow hover:shadow-md">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy text-white">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs font-medium text-teal">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-16 text-center sm:px-12 sm:py-20">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(42,157,143,0.15),transparent_70%)]" />
              <div className="relative z-10">
                <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
                  Ready to Get Started?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
                  Join schools already transforming how they connect with
                  parents and manage daily operations.
                </p>
                <div className="mt-8">
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
