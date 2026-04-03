"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import { ArrowLeft, Loader2 } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <NextImage
          src="/logo.png"
          alt="Skunect"
          width={56}
          height={56}
          className="rounded-2xl mb-8"
          priority
        />

        <h1 className="font-display text-8xl tracking-tighter bg-gradient-to-br from-navy to-teal bg-clip-text text-transparent sm:text-9xl">
          404
        </h1>
        <h2 className="mt-3 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 flex gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
          </Button>
          <Button
            asChild
            className="gap-2 bg-navy hover:bg-navy/90 text-white"
          >
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
