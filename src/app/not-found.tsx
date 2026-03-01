"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(true);

  useEffect(() => {
    // In static export with CloudFront SPA fallback, CloudFront serves this page
    // for any path that doesn't match a physical file. Give the client-side router
    // a moment to resolve the route before showing the 404 UI.
    const timeout = setTimeout(() => {
      setIsResolving(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [router]);

  if (isResolving) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-navy mb-6">
          <GraduationCap className="w-9 h-9 text-white" />
        </div>

        {/* 404 */}
        <h1 className="text-7xl font-extrabold text-navy tracking-tighter mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Page not found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/login">
              <ArrowLeft className="w-4 h-4" />
              Go to Login
            </Link>
          </Button>
          <Button asChild className="gap-2 bg-navy hover:bg-navy/90 text-white">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
