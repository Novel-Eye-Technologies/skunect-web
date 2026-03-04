'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  ClipboardCheck,
  MessageSquare,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';

const features = [
  {
    icon: GraduationCap,
    title: 'Student Management',
    description:
      'Manage student records, enrollment, and academic performance in one place.',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance Tracking',
    description:
      'Track daily attendance with real-time updates for parents and administrators.',
  },
  {
    icon: MessageSquare,
    title: 'Communication Hub',
    description:
      'Keep parents, teachers, and administrators connected with announcements and messages.',
  },
  {
    icon: Shield,
    title: 'Student Welfare',
    description:
      'Monitor student well-being with mood tracking, health records, and welfare logs.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Only run on the root path
    if (window.location.pathname !== '/') return;

    if (token) {
      router.replace('/dashboard');
    } else {
      setChecked(true);
    }
  }, [router, token]);

  // Show spinner while checking auth
  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">Skunect</span>
          </div>
          <Link href="/login">
            <Button>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          School Management
          <br />
          <span className="text-primary">Made Simple</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Skunect connects schools, teachers, and parents on one platform.
          Manage students, track attendance, communicate effectively, and
          monitor student welfare — all in one place.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/login">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Everything You Need
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <feature.icon className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Skunect. All rights reserved.</p>
      </footer>
    </div>
  );
}
