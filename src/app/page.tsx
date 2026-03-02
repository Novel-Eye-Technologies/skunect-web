"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // In Next.js 16 static export with Turbopack, every page's HTML embeds
    // a shell RSC payload that renders the root page component first.
    // We must only redirect when the browser is actually on "/" – otherwise
    // every page would bounce to /login before its real components load.
    if (window.location.pathname === "/") {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy border-t-transparent" />
    </div>
  );
}
