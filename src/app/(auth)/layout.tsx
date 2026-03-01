"use client";

import { GraduationCap, Users, Shield, BookOpen } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-navy">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #2A9D8F 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, #2A9D8F 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Logo and tagline */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal/20 backdrop-blur-sm">
                <GraduationCap className="w-7 h-7 text-teal" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Skunect
              </h1>
            </div>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              School Management &amp; Parent Engagement Platform
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-8">
            <FeatureItem
              icon={<Users className="w-5 h-5" />}
              title="Connect Parents & Schools"
              description="Seamless communication between parents, teachers, and administrators"
            />
            <FeatureItem
              icon={<BookOpen className="w-5 h-5" />}
              title="Track Academic Progress"
              description="Real-time access to grades, attendance, and performance reports"
            />
            <FeatureItem
              icon={<Shield className="w-5 h-5" />}
              title="Secure & Reliable"
              description="Enterprise-grade security to protect student and school data"
            />
          </div>

          {/* Footer */}
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Skunect. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - form area */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-12 bg-background">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-navy">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-navy">Skunect</span>
        </div>

        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal/15 text-teal shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/60 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
