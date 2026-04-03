"use client";

import { Users, Shield, BookOpen } from "lucide-react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Skip to content */}
      <a
        href="#auth-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-teal focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none"
      >
        Skip to content
      </a>

      {/* Left branding panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-navy">
        {/* Background mesh gradients */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_40%,rgba(42,157,143,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(212,168,67,0.06),transparent)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Logo and tagline */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="Skunect"
                width={48}
                height={48}
                className="rounded-xl"
                priority
              />
              <h1 className="font-display text-3xl text-white tracking-tight">
                Skunect
              </h1>
            </div>
            <p className="text-lg text-white/70 max-w-md leading-relaxed">
              School Management &amp; Parent Engagement Platform
            </p>
          </div>

          {/* Feature highlights — staggered entrance */}
          <div className="space-y-8">
            {[
              {
                icon: <Users className="w-5 h-5" />,
                title: "Connect Parents & Schools",
                description: "Seamless communication between parents, teachers, and administrators",
                delay: "0ms",
              },
              {
                icon: <BookOpen className="w-5 h-5" />,
                title: "Track Academic Progress",
                description: "Real-time access to grades, attendance, and performance reports",
                delay: "100ms",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Secure & Reliable",
                description: "Enterprise-grade security to protect student and school data",
                delay: "200ms",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal/15 text-teal shrink-0 mt-0.5">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Skunect. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - form area */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-12 bg-cream">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <Image
            src="/logo.png"
            alt="Skunect"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <span className="font-display text-2xl text-navy">Skunect</span>
        </div>

        <div id="auth-content" className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}
