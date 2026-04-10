"use client";

import Image from "next/image";
import { RotateCw, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <Image
          src="/logo.png"
          alt="Skunect"
          width={56}
          height={56}
          unoptimized
          className="w-14 h-14 rounded-2xl mb-8"
        />

        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" className="gap-2" onClick={reset}>
            <RotateCw className="w-4 h-4" />
            Try again
          </Button>
          <Button
            asChild
            className="gap-2 bg-navy hover:bg-navy/90 text-white"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground/50">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
